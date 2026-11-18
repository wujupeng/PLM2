package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizWorkshopDailySaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizWorkshopDaily;
import com.huaweicloud.plm.system.mapper.OaBizWorkshopDailyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 车间生产日报（OA-DEV-067）：与 MES 生产实绩对账并标注数据来源。
 * 对账开关与默认数据来源均为可配置项；本模块承载日报录入与确认，不篡改 MES 实绩。
 */
@Service
@RequiredArgsConstructor
public class OaBizWorkshopDailyService {

    private static final String STATUS_DRAFT = "DRAFT";

    private static final String STATUS_SUBMITTED = "SUBMITTED";

    private static final String STATUS_CONFIRMED = "CONFIRMED";

    private final OaBizWorkshopDailyMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaBizWorkshopDaily> page(OaBizFlowQuery query) {
        Page<OaBizWorkshopDaily> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizWorkshopDaily>lambdaQuery()
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizWorkshopDaily::getReportStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizWorkshopDaily::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizWorkshopDaily::getDataSource, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizWorkshopDaily::getReportDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizWorkshopDaily::getReportDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizWorkshopDaily::getReportNo, query.getKeyword()).or()
                        .like(OaBizWorkshopDaily::getWorkshop, query.getKeyword()))
                .orderByDesc(OaBizWorkshopDaily::getReportDate)
                .orderByDesc(OaBizWorkshopDaily::getId));
        return PageResult.of(page);
    }

    public OaBizWorkshopDaily detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizWorkshopDailySaveRequest request) {
        OaBizWorkshopDaily entity;
        if (id == null) {
            entity = new OaBizWorkshopDaily();
            entity.setReportNo(flowSupport.nextBizNo("WD"));
            entity.setReporterUserId(UserContext.getUserId());
            entity.setReporterName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setReportStatus(STATUS_DRAFT);
            entity.setReconcileFlag(0);
        } else {
            entity = requireEntity(id);
            if (STATUS_CONFIRMED.equals(entity.getReportStatus())) {
                throw new BusinessException(ResultCode.CONFLICT, "已确认的车间日报不可修改");
            }
        }
        validate(request);
        entity.setReportDate(request.getReportDate());
        entity.setWorkshop(request.getWorkshop());
        entity.setShiftCode(request.getShiftCode());
        entity.setDeptId(request.getDeptId());
        entity.setDeptName(request.getDeptName());
        entity.setPlanQty(request.getPlanQty());
        entity.setOutputQty(request.getOutputQty());
        entity.setQualifiedQty(request.getQualifiedQty());
        entity.setDefectQty(request.getDefectQty());
        entity.setCompleteRate(calcRate(request.getOutputQty(), request.getPlanQty()));
        entity.setDowntimeMinutes(request.getDowntimeMinutes());
        entity.setAbnormalDesc(request.getAbnormalDesc());
        entity.setDataSource(StringUtils.hasText(request.getDataSource()) ? request.getDataSource()
                : flowSupport.configString("oa.biz.workshop.daily.data.source.default", "MANUAL"));
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 提交日报：草稿可提交，进入已提交状态。 */
    @Transactional
    public void submit(Long id) {
        OaBizWorkshopDaily entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getReportStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的车间日报可提交");
        }
        entity.setReportStatus(STATUS_SUBMITTED);
        mapper.updateById(entity);
    }

    /** 确认日报：与 MES 生产实绩对账后确认（对账开关为可配置项）。 */
    @Transactional
    public void confirm(Long id) {
        OaBizWorkshopDaily entity = requireEntity(id);
        if (STATUS_CONFIRMED.equals(entity.getReportStatus())) {
            return;
        }
        entity.setReportStatus(STATUS_CONFIRMED);
        if (flowSupport.configBoolean("oa.biz.workshop.daily.reconcile.mes", true)) {
            entity.setReconcileFlag(1);
        }
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizWorkshopDaily entity = requireEntity(id);
        if (STATUS_CONFIRMED.equals(entity.getReportStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "已确认的车间日报不可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizWorkshopDaily requireEntity(Long id) {
        OaBizWorkshopDaily entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "车间生产日报不存在: " + id);
        }
        return entity;
    }

    private void validate(BizWorkshopDailySaveRequest request) {
        if (request.getReportDate() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "日报日期不能为空");
        }
    }

    private BigDecimal calcRate(BigDecimal actual, BigDecimal base) {
        if (actual == null || base == null || base.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        return actual.multiply(BigDecimal.valueOf(100)).divide(base, 2, RoundingMode.HALF_UP);
    }

    private String currentDisplayName() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.displayName();
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
