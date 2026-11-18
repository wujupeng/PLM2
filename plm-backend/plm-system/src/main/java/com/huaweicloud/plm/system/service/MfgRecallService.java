package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MfgRecallCloseRequest;
import com.huaweicloud.plm.system.dto.MfgRecallDetailResponse;
import com.huaweicloud.plm.system.dto.MfgRecallQuery;
import com.huaweicloud.plm.system.dto.MfgRecallSaveRequest;
import com.huaweicloud.plm.system.entity.MfgProductionBatch;
import com.huaweicloud.plm.system.entity.MfgRecallImpact;
import com.huaweicloud.plm.system.entity.MfgRecallOrder;
import com.huaweicloud.plm.system.entity.MfgShipment;
import com.huaweicloud.plm.system.entity.MfgTraceBinding;
import com.huaweicloud.plm.system.entity.WmsMaterialBatch;
import com.huaweicloud.plm.system.mapper.MfgProductionBatchMapper;
import com.huaweicloud.plm.system.mapper.MfgRecallImpactMapper;
import com.huaweicloud.plm.system.mapper.MfgRecallOrderMapper;
import com.huaweicloud.plm.system.mapper.MfgShipmentMapper;
import com.huaweicloud.plm.system.mapper.MfgTraceBindingMapper;
import com.huaweicloud.plm.system.mapper.WmsMaterialBatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 召回与批次隔离服务（N8，DEV-094）。
 * 按物料批次/生产批次/客户/日期圈定风险范围，生成影响清单，冻结库存与待发产品，关闭需提供证据。
 */
@Service
@RequiredArgsConstructor
public class MfgRecallService {

    private static final String TYPE_MATERIAL_BATCH = "MATERIAL_BATCH";
    private static final String TYPE_PRODUCTION_BATCH = "PRODUCTION_BATCH";
    private static final String TYPE_CUSTOMER = "CUSTOMER";
    private static final String TYPE_DATE_RANGE = "DATE_RANGE";
    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_ISOLATING = "ISOLATING";
    private static final String STATUS_ISOLATED = "ISOLATED";
    private static final String STATUS_CLOSED = "CLOSED";
    private static final String IMPACT_IDENTIFIED = "IDENTIFIED";
    private static final String IMPACT_ISOLATED = "ISOLATED";
    private static final String IMPACT_PRODUCT = "PRODUCT";
    private static final String IMPACT_STOCK = "STOCK";
    private static final String IMPACT_WORK_ORDER = "WORK_ORDER";
    private static final String IMPACT_CUSTOMER = "CUSTOMER";
    private static final String STOCK_ISOLATED = "SCRAPPED";

    private final MfgRecallOrderMapper mfgRecallOrderMapper;
    private final MfgRecallImpactMapper mfgRecallImpactMapper;
    private final MfgTraceBindingMapper mfgTraceBindingMapper;
    private final MfgProductionBatchMapper mfgProductionBatchMapper;
    private final MfgShipmentMapper mfgShipmentMapper;
    private final WmsMaterialBatchMapper wmsMaterialBatchMapper;
    private final MfgSupportService mfgSupport;

    public PageResult<MfgRecallOrder> page(MfgRecallQuery query) {
        Page<MfgRecallOrder> page = query.toPage();
        mfgRecallOrderMapper.selectPage(page, Wrappers.<MfgRecallOrder>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecallNo()), MfgRecallOrder::getRecallNo, query.getRecallNo())
                .eq(StringUtils.hasText(query.getRecallType()), MfgRecallOrder::getRecallType, query.getRecallType())
                .eq(StringUtils.hasText(query.getRecallStatus()), MfgRecallOrder::getRecallStatus, query.getRecallStatus())
                .eq(StringUtils.hasText(query.getRiskLevel()), MfgRecallOrder::getRiskLevel, query.getRiskLevel())
                .eq(StringUtils.hasText(query.getOwner()), MfgRecallOrder::getOwner, query.getOwner())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MfgRecallOrder::getRecallNo, query.getKeyword()).or()
                        .like(MfgRecallOrder::getTargetValue, query.getKeyword()).or()
                        .like(MfgRecallOrder::getReason, query.getKeyword()))
                .orderByDesc(MfgRecallOrder::getId));
        return PageResult.of(page);
    }

    public MfgRecallDetailResponse detail(String recallNo) {
        MfgRecallOrder recall = requireRecall(recallNo);
        MfgRecallDetailResponse response = new MfgRecallDetailResponse();
        response.setRecall(recall);
        response.setImpacts(listImpacts(recallNo));
        return response;
    }

    public List<MfgRecallImpact> listImpacts(String recallNo) {
        return mfgRecallImpactMapper.selectList(Wrappers.<MfgRecallImpact>lambdaQuery()
                .eq(MfgRecallImpact::getRecallNo, recallNo)
                .orderByAsc(MfgRecallImpact::getImpactType)
                .orderByAsc(MfgRecallImpact::getId));
    }

    public MfgRecallOrder requireRecall(String recallNo) {
        MfgRecallOrder recall = mfgRecallOrderMapper.selectOne(Wrappers.<MfgRecallOrder>lambdaQuery()
                .eq(MfgRecallOrder::getRecallNo, recallNo));
        if (recall == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "召回单不存在: " + recallNo);
        }
        return recall;
    }

    /**
     * 创建召回单并按类型生成影响清单。
     */
    @Transactional
    public Long create(MfgRecallSaveRequest request) {
        String recallNo = StringUtils.hasText(request.getRecallNo())
                ? request.getRecallNo() : mfgSupport.nextNo("RC");
        if (mfgRecallOrderMapper.selectCount(Wrappers.<MfgRecallOrder>lambdaQuery()
                .eq(MfgRecallOrder::getRecallNo, recallNo)) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "召回单号已存在: " + recallNo);
        }
        MfgRecallOrder recall = new MfgRecallOrder();
        recall.setRecallNo(recallNo);
        recall.setRecallType(request.getRecallType());
        recall.setTriggerSource(request.getTriggerSource());
        recall.setTargetValue(request.getTargetValue());
        recall.setRiskLevel(StringUtils.hasText(request.getRiskLevel()) ? request.getRiskLevel() : "MEDIUM");
        recall.setOwner(StringUtils.hasText(request.getOwner())
                ? request.getOwner() : mfgSupport.config("mfg.recall.owner.default", UserContext.getUsername()));
        recall.setReason(request.getReason());
        recall.setRemark(request.getRemark());
        recall.setRecallStatus(STATUS_OPEN);
        recall.setOpenedAt(LocalDateTime.now());
        recall.setAffectedCount(0);
        mfgRecallOrderMapper.insert(recall);

        int affected = buildImpacts(recall);
        recall.setAffectedCount(affected);
        mfgRecallOrderMapper.updateById(recall);
        return recall.getId();
    }

    /**
     * 执行隔离：冻结库存与待发产品，影响清单置为已隔离。
     */
    @Transactional
    public MfgRecallOrder isolate(String recallNo) {
        MfgRecallOrder recall = requireRecall(recallNo);
        if (STATUS_CLOSED.equals(recall.getRecallStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已关闭的召回单不允许再隔离");
        }
        if (STATUS_ISOLATED.equals(recall.getRecallStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "召回单已隔离: " + recallNo);
        }
        recall.setRecallStatus(STATUS_ISOLATING);
        mfgRecallOrderMapper.updateById(recall);

        List<MfgRecallImpact> impacts = listImpacts(recallNo);
        for (MfgRecallImpact impact : impacts) {
            impact.setImpactStatus(IMPACT_ISOLATED);
            mfgRecallImpactMapper.updateById(impact);
        }
        if (mfgSupport.configBool("mfg.recall.isolate.stock.auto", true)) {
            isolateStock(impacts);
        }

        recall.setRecallStatus(STATUS_ISOLATED);
        mfgRecallOrderMapper.updateById(recall);
        return recall;
    }

    /**
     * 关闭召回单：必须提供关闭证据。
     */
    @Transactional
    public MfgRecallOrder close(String recallNo, MfgRecallCloseRequest request) {
        MfgRecallOrder recall = requireRecall(recallNo);
        if (STATUS_CLOSED.equals(recall.getRecallStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "召回单已关闭: " + recallNo);
        }
        if (!StringUtils.hasText(request.getCloseEvidence())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "关闭召回单必须提供关闭证据");
        }
        recall.setCloseEvidence(request.getCloseEvidence());
        recall.setClosedAt(LocalDateTime.now());
        recall.setRecallStatus(STATUS_CLOSED);
        if (StringUtils.hasText(request.getRemark())) {
            recall.setRemark(request.getRemark());
        }
        mfgRecallOrderMapper.updateById(recall);

        for (MfgRecallImpact impact : listImpacts(recallNo)) {
            impact.setImpactStatus(STATUS_CLOSED);
            mfgRecallImpactMapper.updateById(impact);
        }
        return recall;
    }

    public void delete(String recallNo) {
        MfgRecallOrder recall = requireRecall(recallNo);
        if (!STATUS_OPEN.equals(recall.getRecallStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "仅未隔离的召回单允许删除");
        }
        mfgRecallImpactMapper.delete(Wrappers.<MfgRecallImpact>lambdaQuery()
                .eq(MfgRecallImpact::getRecallNo, recallNo));
        mfgRecallOrderMapper.deleteById(recall.getId());
    }

    /**
     * 依据召回类型生成影响清单，返回影响条目数（不含库存条目）。
     */
    private int buildImpacts(MfgRecallOrder recall) {
        String target = recall.getTargetValue();
        int count = 0;
        if (TYPE_MATERIAL_BATCH.equals(recall.getRecallType())) {
            List<MfgTraceBinding> bindings = mfgTraceBindingMapper.selectList(Wrappers.<MfgTraceBinding>lambdaQuery()
                    .eq(MfgTraceBinding::getMaterialBatchNo, target)
                    .orderByAsc(MfgTraceBinding::getId));
            for (MfgTraceBinding binding : bindings) {
                insertImpact(recall, IMPACT_PRODUCT, binding.getTraceCode(), binding.getProductCode(),
                        binding.getBatchNo(), binding.getMaterialCode(), binding.getMaterialBatchNo(),
                        null, binding.getQuantity());
                count++;
            }
        } else if (TYPE_PRODUCTION_BATCH.equals(recall.getRecallType())) {
            List<MfgTraceBinding> bindings = mfgTraceBindingMapper.selectList(Wrappers.<MfgTraceBinding>lambdaQuery()
                    .eq(MfgTraceBinding::getBatchNo, target)
                    .orderByAsc(MfgTraceBinding::getId));
            for (MfgTraceBinding binding : bindings) {
                insertImpact(recall, IMPACT_PRODUCT, binding.getTraceCode(), binding.getProductCode(),
                        binding.getBatchNo(), binding.getMaterialCode(), binding.getMaterialBatchNo(),
                        null, binding.getQuantity());
                count++;
            }
        } else if (TYPE_CUSTOMER.equals(recall.getRecallType())) {
            List<MfgShipment> shipments = mfgShipmentMapper.selectList(Wrappers.<MfgShipment>lambdaQuery()
                    .eq(MfgShipment::getCustomerCode, target)
                    .orderByAsc(MfgShipment::getId));
            for (MfgShipment shipment : shipments) {
                insertImpact(recall, IMPACT_CUSTOMER, shipment.getShipmentNo(), shipment.getProductCode(),
                        null, null, null, shipment.getCustomerCode(),
                        shipment.getScannedQty() != null ? shipment.getScannedQty() : shipment.getOrderQty());
                count++;
            }
        } else if (TYPE_DATE_RANGE.equals(recall.getRecallType())) {
            LocalDate[] range = parseDateRange(target);
            List<MfgProductionBatch> batches = mfgProductionBatchMapper.selectList(
                    Wrappers.<MfgProductionBatch>lambdaQuery()
                            .ge(range[0] != null, MfgProductionBatch::getProductionDate, range[0])
                            .le(range[1] != null, MfgProductionBatch::getProductionDate, range[1])
                            .orderByAsc(MfgProductionBatch::getId));
            for (MfgProductionBatch batch : batches) {
                insertImpact(recall, IMPACT_WORK_ORDER, batch.getWorkOrderNo(), batch.getProductCode(),
                        batch.getBatchNo(), null, null, null, batch.getCompletedQty());
                count++;
            }
        }
        return count;
    }

    private void insertImpact(MfgRecallOrder recall, String impactType, String refNo, String productCode,
                              String batchNo, String materialCode, String materialBatchNo, String customerCode,
                              BigDecimal qty) {
        MfgRecallImpact impact = new MfgRecallImpact();
        impact.setRecallNo(recall.getRecallNo());
        impact.setImpactType(impactType);
        impact.setImpactRefNo(refNo);
        impact.setProductCode(productCode);
        impact.setBatchNo(batchNo);
        impact.setMaterialCode(materialCode);
        impact.setMaterialBatchNo(materialBatchNo);
        impact.setCustomerCode(customerCode);
        impact.setQty(qty == null ? BigDecimal.ZERO : qty);
        impact.setImpactStatus(IMPACT_IDENTIFIED);
        mfgRecallImpactMapper.insert(impact);
    }

    /**
     * 依据影响清单冻结在库物料批次。
     */
    private void isolateStock(List<MfgRecallImpact> impacts) {
        List<String> materialBatchNos = new ArrayList<>();
        for (MfgRecallImpact impact : impacts) {
            if (StringUtils.hasText(impact.getMaterialBatchNo())
                    && !materialBatchNos.contains(impact.getMaterialBatchNo())) {
                materialBatchNos.add(impact.getMaterialBatchNo());
            }
        }
        if (materialBatchNos.isEmpty()) {
            return;
        }
        List<WmsMaterialBatch> stocks = wmsMaterialBatchMapper.selectList(Wrappers.<WmsMaterialBatch>lambdaQuery()
                .in(WmsMaterialBatch::getBatchNo, materialBatchNos));
        for (WmsMaterialBatch stock : stocks) {
            stock.setBatchStatus(STOCK_ISOLATED);
            wmsMaterialBatchMapper.updateById(stock);
        }
    }

    private LocalDate[] parseDateRange(String target) {
        LocalDate from = null;
        LocalDate to = null;
        if (StringUtils.hasText(target)) {
            String[] parts = target.split("~");
            try {
                if (parts.length > 0 && StringUtils.hasText(parts[0])) {
                    from = LocalDate.parse(parts[0].trim());
                }
                if (parts.length > 1 && StringUtils.hasText(parts[1])) {
                    to = LocalDate.parse(parts[1].trim());
                }
            } catch (Exception ignored) {
                // 日期范围格式非法时不做日期过滤，由调用方在备注中说明。
            }
        }
        return new LocalDate[]{from, to};
    }
}
