package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsShortageCalcRequest;
import com.huaweicloud.plm.system.dto.WmsShortageCaseActionRequest;
import com.huaweicloud.plm.system.dto.WmsShortageCaseCloseRequest;
import com.huaweicloud.plm.system.dto.WmsShortageCaseCreateRequest;
import com.huaweicloud.plm.system.dto.WmsShortageCaseQuery;
import com.huaweicloud.plm.system.dto.WmsShortageCaseUpdateRequest;
import com.huaweicloud.plm.system.dto.WmsWarningQuery;
import com.huaweicloud.plm.system.entity.WmsMaterialBatch;
import com.huaweicloud.plm.system.entity.WmsShortageAction;
import com.huaweicloud.plm.system.entity.WmsShortageCase;
import com.huaweicloud.plm.system.entity.WmsShortageWarning;
import com.huaweicloud.plm.system.mapper.WmsMaterialBatchMapper;
import com.huaweicloud.plm.system.mapper.WmsShortageActionMapper;
import com.huaweicloud.plm.system.mapper.WmsShortageCaseMapper;
import com.huaweicloud.plm.system.mapper.WmsShortageWarningMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 缺料预警与欠料闭环服务（N7，DEV-082/083）：
 * 缺料预警按需求+库存+在途+采购交期+计划+安全库存计算缺口并分级；
 * 欠料异常单承载责任人/影响工单/原因/临时措施/预计恢复/关闭证据的完整闭环。
 */
@Service
@RequiredArgsConstructor
public class WmsShortageService {

    private static final String WARNING_OPEN = "OPEN";
    private static final String WARNING_PROCESSING = "PROCESSING";
    private static final String WARNING_CLOSED = "CLOSED";
    private static final String CASE_OPEN = "OPEN";
    private static final String CASE_PROCESSING = "PROCESSING";
    private static final String CASE_CLOSED = "CLOSED";
    private static final String LEVEL_CRITICAL = "CRITICAL";
    private static final String LEVEL_L2 = "L2";

    private final WmsShortageWarningMapper warningMapper;
    private final WmsShortageCaseMapper caseMapper;
    private final WmsShortageActionMapper actionMapper;
    private final WmsMaterialBatchMapper batchMapper;
    private final WmsSupportService wmsSupport;

    // ==================== 缺料预警（DEV-082） ====================

    public PageResult<WmsShortageWarning> warningPage(WmsWarningQuery query) {
        Page<WmsShortageWarning> page = query.toPage();
        warningMapper.selectPage(page, Wrappers.<WmsShortageWarning>lambdaQuery()
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsShortageWarning::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), WmsShortageWarning::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsShortageWarning::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getWarningLevel()), WmsShortageWarning::getWarningLevel, query.getWarningLevel())
                .eq(StringUtils.hasText(query.getWarningStatus()), WmsShortageWarning::getWarningStatus, query.getWarningStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsShortageWarning::getWarningNo, query.getKeyword()).or()
                        .like(WmsShortageWarning::getMaterialCode, query.getKeyword()).or()
                        .like(WmsShortageWarning::getWorkOrderNo, query.getKeyword()))
                .orderByDesc(WmsShortageWarning::getId));
        return PageResult.of(page);
    }

    public WmsShortageWarning requireWarning(String warningNo) {
        WmsShortageWarning warning = warningMapper.selectOne(Wrappers.<WmsShortageWarning>lambdaQuery()
                .eq(WmsShortageWarning::getWarningNo, warningNo));
        if (warning == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "缺料预警不存在: " + warningNo);
        }
        return warning;
    }

    /**
     * 计算并生成缺料预警：现有库存取在库批次合计，在途与安全库存取请求或配置默认值，缺口为
     * 需求量 + 安全库存 - 现有库存 - 在途量；需求日期落在采购提前期内则判定为紧急。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsShortageWarning calculate(WmsShortageCalcRequest request) {
        BigDecimal requiredQty = nvl(request.getRequiredQty());
        BigDecimal onHand = onHandQty(request.getMaterialCode());
        BigDecimal inTransit = request.getInTransitQty() == null ? BigDecimal.ZERO : request.getInTransitQty();
        BigDecimal safetyStock = request.getSafetyStock() != null ? request.getSafetyStock()
                : wmsSupport.configDecimal("wms.shortage.safety.stock.default", BigDecimal.ZERO);
        int leadTimeDays = request.getPurchaseLeadTimeDays() != null ? request.getPurchaseLeadTimeDays()
                : wmsSupport.configInt("wms.shortage.lead.time.days", 7);

        BigDecimal gap = requiredQty.add(safetyStock).subtract(onHand).subtract(inTransit);
        if (gap.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "库存充足，未生成缺料预警：" + request.getMaterialCode());
        }

        LocalDate today = LocalDate.now();
        String level = request.getRequiredDate() != null
                && !request.getRequiredDate().isAfter(today.plusDays(leadTimeDays)) ? LEVEL_CRITICAL : LEVEL_L2;

        WmsShortageWarning warning = new WmsShortageWarning();
        warning.setWarningNo(wmsSupport.nextNo("SHW"));
        warning.setMaterialCode(request.getMaterialCode());
        warning.setMaterialName(request.getMaterialName());
        warning.setLineCode(request.getLineCode());
        warning.setWorkOrderNo(request.getWorkOrderNo());
        warning.setRequiredQty(requiredQty);
        warning.setOnHandQty(onHand);
        warning.setInTransitQty(inTransit);
        warning.setSafetyStock(safetyStock);
        warning.setGapQty(gap);
        warning.setRequiredDate(request.getRequiredDate());
        warning.setPurchaseLeadTimeDays(leadTimeDays);
        warning.setWarningLevel(level);
        warning.setCalcBasis("需求=" + requiredQty + "，现有=" + onHand + "，在途=" + inTransit
                + "，安全库存=" + safetyStock + "，缺口=" + gap);
        warning.setWarningStatus(WARNING_OPEN);
        warning.setCalcAt(LocalDateTime.now());
        warning.setSource("CALC");
        warning.setRemark(request.getRemark());
        warningMapper.insert(warning);
        return warning;
    }

    private BigDecimal onHandQty(String materialCode) {
        List<WmsMaterialBatch> batches = batchMapper.selectList(Wrappers.<WmsMaterialBatch>lambdaQuery()
                .eq(WmsMaterialBatch::getMaterialCode, materialCode)
                .eq(WmsMaterialBatch::getBatchStatus, "IN_STOCK"));
        BigDecimal total = BigDecimal.ZERO;
        for (WmsMaterialBatch batch : batches) {
            total = total.add(nvl(batch.getQtyOnHand()));
        }
        return total;
    }

    // ==================== 欠料异常闭环（DEV-083） ====================

    public PageResult<WmsShortageCase> casePage(WmsShortageCaseQuery query) {
        Page<WmsShortageCase> page = query.toPage();
        caseMapper.selectPage(page, Wrappers.<WmsShortageCase>lambdaQuery()
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsShortageCase::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), WmsShortageCase::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWarningNo()), WmsShortageCase::getWarningNo, query.getWarningNo())
                .eq(StringUtils.hasText(query.getOwner()), WmsShortageCase::getOwner, query.getOwner())
                .eq(StringUtils.hasText(query.getCaseStatus()), WmsShortageCase::getCaseStatus, query.getCaseStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsShortageCase::getCaseNo, query.getKeyword()).or()
                        .like(WmsShortageCase::getMaterialCode, query.getKeyword()).or()
                        .like(WmsShortageCase::getAffectedWorkOrders, query.getKeyword()))
                .orderByDesc(WmsShortageCase::getId));
        return PageResult.of(page);
    }

    public WmsShortageCase requireCase(String caseNo) {
        WmsShortageCase shortageCase = caseMapper.selectOne(Wrappers.<WmsShortageCase>lambdaQuery()
                .eq(WmsShortageCase::getCaseNo, caseNo));
        if (shortageCase == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "欠料单不存在: " + caseNo);
        }
        return shortageCase;
    }

    public List<WmsShortageAction> listActions(String caseNo) {
        WmsShortageCase shortageCase = requireCase(caseNo);
        return actionMapper.selectList(Wrappers.<WmsShortageAction>lambdaQuery()
                .eq(WmsShortageAction::getCaseId, shortageCase.getId())
                .orderByAsc(WmsShortageAction::getId));
    }

    /**
     * 创建欠料异常单：默认责任人取配置项，若关联缺料预警则把预警置为处理中，并留痕登记动作。
     */
    @Transactional(rollbackFor = Exception.class)
    public String createCase(WmsShortageCaseCreateRequest request) {
        WmsShortageCase shortageCase = new WmsShortageCase();
        shortageCase.setCaseNo(wmsSupport.nextNo("SHC"));
        shortageCase.setWarningNo(request.getWarningNo());
        shortageCase.setMaterialCode(request.getMaterialCode());
        shortageCase.setMaterialName(request.getMaterialName());
        shortageCase.setLineCode(request.getLineCode());
        shortageCase.setAffectedWorkOrders(request.getAffectedWorkOrders());
        shortageCase.setOwner(StringUtils.hasText(request.getOwner())
                ? request.getOwner() : wmsSupport.config("wms.shortage.owner.default", "计划员"));
        shortageCase.setCause(request.getCause());
        shortageCase.setTempMeasure(request.getTempMeasure());
        shortageCase.setExpectedRecoveryDate(request.getExpectedRecoveryDate());
        shortageCase.setCaseStatus(CASE_OPEN);
        shortageCase.setRemark(request.getRemark());
        caseMapper.insert(shortageCase);

        if (StringUtils.hasText(request.getWarningNo())) {
            WmsShortageWarning warning = requireWarning(request.getWarningNo());
            warning.setWarningStatus(WARNING_PROCESSING);
            warningMapper.updateById(warning);
        }
        writeAction(shortageCase, "REGISTER", "登记欠料异常单，责任人：" + shortageCase.getOwner(), null);
        return shortageCase.getCaseNo();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCase(String caseNo, WmsShortageCaseUpdateRequest request) {
        WmsShortageCase shortageCase = requireCase(caseNo);
        if (CASE_CLOSED.equals(shortageCase.getCaseStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "欠料单已关闭，不可修改: " + caseNo);
        }
        if (StringUtils.hasText(request.getAffectedWorkOrders())) {
            shortageCase.setAffectedWorkOrders(request.getAffectedWorkOrders());
        }
        if (StringUtils.hasText(request.getOwner())) {
            shortageCase.setOwner(request.getOwner());
        }
        if (StringUtils.hasText(request.getCause())) {
            shortageCase.setCause(request.getCause());
        }
        if (StringUtils.hasText(request.getTempMeasure())) {
            shortageCase.setTempMeasure(request.getTempMeasure());
        }
        if (request.getExpectedRecoveryDate() != null) {
            shortageCase.setExpectedRecoveryDate(request.getExpectedRecoveryDate());
        }
        if (StringUtils.hasText(request.getRemark())) {
            shortageCase.setRemark(request.getRemark());
        }
        caseMapper.updateById(shortageCase);
    }

    /**
     * 追加欠料处理记录：登记/措施/升级/恢复等过程留痕，并把待处理状态推进为处理中。
     */
    @Transactional(rollbackFor = Exception.class)
    public void addAction(String caseNo, WmsShortageCaseActionRequest request) {
        WmsShortageCase shortageCase = requireCase(caseNo);
        if (CASE_CLOSED.equals(shortageCase.getCaseStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "欠料单已关闭，不可追加处理记录: " + caseNo);
        }
        if (CASE_OPEN.equals(shortageCase.getCaseStatus())) {
            shortageCase.setCaseStatus(CASE_PROCESSING);
            caseMapper.updateById(shortageCase);
        }
        writeAction(shortageCase, request.getActionType(), request.getContent(), request.getOperatorName());
    }

    /**
     * 关闭欠料单：必须填写关闭证据，关闭后同步关闭关联缺料预警并留痕。
     */
    @Transactional(rollbackFor = Exception.class)
    public void closeCase(String caseNo, WmsShortageCaseCloseRequest request) {
        WmsShortageCase shortageCase = requireCase(caseNo);
        if (CASE_CLOSED.equals(shortageCase.getCaseStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "欠料单已关闭: " + caseNo);
        }
        String operator = StringUtils.hasText(request.getClosedBy()) ? request.getClosedBy() : UserContext.getUsername();
        shortageCase.setCaseStatus(CASE_CLOSED);
        shortageCase.setCloseEvidence(request.getCloseEvidence());
        shortageCase.setClosedBy(operator);
        shortageCase.setClosedAt(LocalDateTime.now());
        if (StringUtils.hasText(request.getRemark())) {
            shortageCase.setRemark(request.getRemark());
        }
        caseMapper.updateById(shortageCase);

        if (StringUtils.hasText(shortageCase.getWarningNo())) {
            WmsShortageWarning warning = warningMapper.selectOne(Wrappers.<WmsShortageWarning>lambdaQuery()
                    .eq(WmsShortageWarning::getWarningNo, shortageCase.getWarningNo()));
            if (warning != null) {
                warning.setWarningStatus(WARNING_CLOSED);
                warningMapper.updateById(warning);
            }
        }
        writeAction(shortageCase, "CLOSE", "关闭欠料单，证据：" + request.getCloseEvidence(), operator);
    }

    private void writeAction(WmsShortageCase shortageCase, String actionType, String content, String operator) {
        WmsShortageAction action = new WmsShortageAction();
        action.setCaseId(shortageCase.getId());
        action.setCaseNo(shortageCase.getCaseNo());
        action.setActionType(actionType);
        action.setContent(content);
        action.setOperatorName(StringUtils.hasText(operator) ? operator : UserContext.getUsername());
        action.setActionAt(LocalDateTime.now());
        actionMapper.insert(action);
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
