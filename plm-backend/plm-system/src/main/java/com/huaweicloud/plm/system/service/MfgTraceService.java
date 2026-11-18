package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MfgForwardTraceResponse;
import com.huaweicloud.plm.system.dto.MfgTraceQuery;
import com.huaweicloud.plm.system.dto.MfgTraceResponse;
import com.huaweicloud.plm.system.entity.MfgOperationRecord;
import com.huaweicloud.plm.system.entity.MfgPackage;
import com.huaweicloud.plm.system.entity.MfgProductionBatch;
import com.huaweicloud.plm.system.entity.MfgRecallImpact;
import com.huaweicloud.plm.system.entity.MfgShipment;
import com.huaweicloud.plm.system.entity.MfgTestResult;
import com.huaweicloud.plm.system.entity.MfgTraceBinding;
import com.huaweicloud.plm.system.mapper.MfgOperationRecordMapper;
import com.huaweicloud.plm.system.mapper.MfgPackageMapper;
import com.huaweicloud.plm.system.mapper.MfgProductionBatchMapper;
import com.huaweicloud.plm.system.mapper.MfgRecallImpactMapper;
import com.huaweicloud.plm.system.mapper.MfgTestResultMapper;
import com.huaweicloud.plm.system.mapper.MfgTraceBindingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 全流程正反向追溯服务（N8，DEV-093）。
 * 反向追溯：由产品追溯码/序列号反查生产批次、物料批次、工序、测试、包装与出货。
 * 正向追溯：由物料批次反查受影响产品、生产批次与已发运客户。
 */
@Service
@RequiredArgsConstructor
public class MfgTraceService {

    private static final String TRACE_TYPE_SINGLE = "SINGLE";
    private static final String TRACE_TYPE_BATCH = "BATCH";
    private static final String STATUS_CLOSED = "CLOSED";

    private final MfgTraceBindingMapper mfgTraceBindingMapper;
    private final MfgProductionBatchMapper mfgProductionBatchMapper;
    private final MfgOperationRecordMapper mfgOperationRecordMapper;
    private final MfgTestResultMapper mfgTestResultMapper;
    private final MfgPackageMapper mfgPackageMapper;
    private final MfgRecallImpactMapper mfgRecallImpactMapper;
    private final MfgShipmentService mfgShipmentService;

    /**
     * 反向追溯：由追溯码/序列号/批次号反查全流程数据。
     */
    public MfgTraceResponse trace(MfgTraceQuery query) {
        String traceCode = StringUtils.hasText(query.getTraceCode()) ? query.getTraceCode().trim() : null;
        String serialNo = StringUtils.hasText(query.getSerialNo()) ? query.getSerialNo().trim() : null;
        String batchNo = StringUtils.hasText(query.getBatchNo()) ? query.getBatchNo().trim() : null;
        if (!StringUtils.hasText(traceCode) && !StringUtils.hasText(serialNo) && !StringUtils.hasText(batchNo)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "追溯码、序列号或生产批次号至少提供一个");
        }

        List<MfgTraceBinding> bindings = new ArrayList<>();
        if (StringUtils.hasText(traceCode) || StringUtils.hasText(serialNo)) {
            String code = StringUtils.hasText(traceCode) ? traceCode : serialNo;
            bindings = mfgTraceBindingMapper.selectList(Wrappers.<MfgTraceBinding>lambdaQuery()
                    .eq(MfgTraceBinding::getTraceCode, code)
                    .or()
                    .eq(MfgTraceBinding::getSerialNo, code)
                    .orderByAsc(MfgTraceBinding::getId));
        }

        String resolvedBatchNo = batchNo;
        if (!StringUtils.hasText(resolvedBatchNo) && !bindings.isEmpty()) {
            resolvedBatchNo = bindings.get(0).getBatchNo();
        }

        MfgTraceResponse response = new MfgTraceResponse();
        response.setTraceCode(StringUtils.hasText(traceCode) ? traceCode
                : (!bindings.isEmpty() ? bindings.get(0).getTraceCode() : resolvedBatchNo));
        response.setMaterialBindings(bindings);
        response.setRecalled(false);

        if (!bindings.isEmpty()) {
            String type = bindings.get(0).getTraceType();
            response.setTraceType(StringUtils.hasText(type)
                    ? type : (StringUtils.hasText(bindings.get(0).getSerialNo()) ? TRACE_TYPE_SINGLE : TRACE_TYPE_BATCH));
        } else if (StringUtils.hasText(resolvedBatchNo)) {
            response.setTraceType(TRACE_TYPE_BATCH);
        }

        if (StringUtils.hasText(resolvedBatchNo)) {
            MfgProductionBatch batch = mfgProductionBatchMapper.selectOne(Wrappers.<MfgProductionBatch>lambdaQuery()
                    .eq(MfgProductionBatch::getBatchNo, resolvedBatchNo));
            response.setProductionBatch(batch);
            response.setOperationRecords(mfgOperationRecordMapper.selectList(
                    Wrappers.<MfgOperationRecord>lambdaQuery()
                            .eq(MfgOperationRecord::getBatchNo, resolvedBatchNo)
                            .orderByAsc(MfgOperationRecord::getSeqNo)
                            .orderByAsc(MfgOperationRecord::getId)));
            response.setTestResults(mfgTestResultMapper.selectList(Wrappers.<MfgTestResult>lambdaQuery()
                    .eq(MfgTestResult::getBatchNo, resolvedBatchNo)
                    .orderByAsc(MfgTestResult::getId)));
            response.setPackages(mfgPackageMapper.selectList(Wrappers.<MfgPackage>lambdaQuery()
                    .eq(MfgPackage::getBatchNo, resolvedBatchNo)
                    .orderByAsc(MfgPackage::getId)));
            response.setShipments(mfgShipmentService.listByBatch(resolvedBatchNo));
        } else {
            response.setOperationRecords(List.of());
            response.setTestResults(List.of());
            response.setPackages(List.of());
            response.setShipments(List.of());
        }

        response.setRecalled(isRecalled(response.getTraceCode(), resolvedBatchNo, bindings));
        return response;
    }

    /**
     * 正向追溯：由物料编码 + 物料批次反查受影响产品批次、产品追溯码与已发运客户。
     */
    public MfgForwardTraceResponse forwardTrace(MfgTraceQuery query) {
        String materialCode = StringUtils.hasText(query.getMaterialCode()) ? query.getMaterialCode().trim() : null;
        String materialBatchNo = StringUtils.hasText(query.getMaterialBatchNo())
                ? query.getMaterialBatchNo().trim() : null;
        if (!StringUtils.hasText(materialCode) && !StringUtils.hasText(materialBatchNo)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码或物料批次号至少提供一个");
        }

        List<MfgTraceBinding> bindings = mfgTraceBindingMapper.selectList(Wrappers.<MfgTraceBinding>lambdaQuery()
                .eq(StringUtils.hasText(materialCode), MfgTraceBinding::getMaterialCode, materialCode)
                .eq(StringUtils.hasText(materialBatchNo), MfgTraceBinding::getMaterialBatchNo, materialBatchNo)
                .orderByAsc(MfgTraceBinding::getId));

        MfgForwardTraceResponse response = new MfgForwardTraceResponse();
        response.setMaterialCode(materialCode);
        response.setMaterialBatchNo(materialBatchNo);
        response.setBindings(bindings);

        Set<String> batchNos = new LinkedHashSet<>();
        Set<String> traceCodes = new LinkedHashSet<>();
        BigDecimal affected = BigDecimal.ZERO;
        for (MfgTraceBinding binding : bindings) {
            if (StringUtils.hasText(binding.getBatchNo())) {
                batchNos.add(binding.getBatchNo());
            }
            if (StringUtils.hasText(binding.getTraceCode())) {
                traceCodes.add(binding.getTraceCode());
            }
            affected = affected.add(binding.getQuantity() == null ? BigDecimal.ONE : binding.getQuantity());
        }

        if (!batchNos.isEmpty()) {
            response.setProductionBatches(mfgProductionBatchMapper.selectList(
                    Wrappers.<MfgProductionBatch>lambdaQuery()
                            .in(MfgProductionBatch::getBatchNo, batchNos)
                            .orderByAsc(MfgProductionBatch::getId)));
            List<MfgShipment> shipments = new ArrayList<>();
            for (String batchNo : batchNos) {
                shipments.addAll(mfgShipmentService.listByBatch(batchNo));
            }
            response.setShipments(shipments);
        } else {
            response.setProductionBatches(List.of());
            response.setShipments(List.of());
        }

        response.setAffectedTraceCodes(new ArrayList<>(traceCodes));
        response.setAffectedCount(affected.intValue());
        return response;
    }

    /**
     * 判断追溯对象是否命中未关闭的召回影响清单。
     */
    private boolean isRecalled(String traceCode, String batchNo, List<MfgTraceBinding> bindings) {
        List<String> refNos = new ArrayList<>();
        if (StringUtils.hasText(traceCode)) {
            refNos.add(traceCode);
        }
        if (StringUtils.hasText(batchNo)) {
            refNos.add(batchNo);
        }
        List<String> materialBatchNos = new ArrayList<>();
        for (MfgTraceBinding binding : bindings) {
            if (StringUtils.hasText(binding.getMaterialBatchNo())) {
                materialBatchNos.add(binding.getMaterialBatchNo());
            }
        }
        if (refNos.isEmpty() && materialBatchNos.isEmpty()) {
            return false;
        }
        Long count = mfgRecallImpactMapper.selectCount(Wrappers.<MfgRecallImpact>lambdaQuery()
                .ne(MfgRecallImpact::getImpactStatus, STATUS_CLOSED)
                .and(w -> {
                    boolean first = true;
                    if (!refNos.isEmpty()) {
                        w.in(MfgRecallImpact::getImpactRefNo, refNos);
                        first = false;
                    }
                    if (!materialBatchNos.isEmpty()) {
                        if (!first) {
                            w.or();
                        }
                        w.in(MfgRecallImpact::getMaterialBatchNo, materialBatchNos);
                        first = false;
                    }
                    if (StringUtils.hasText(batchNo)) {
                        if (!first) {
                            w.or();
                        }
                        w.eq(MfgRecallImpact::getBatchNo, batchNo);
                    }
                }));
        return count != null && count > 0;
    }
}
