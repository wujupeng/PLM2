package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProcessReportQuery;
import com.huaweicloud.plm.system.dto.ErpProcessReportSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessReport;
import com.huaweicloud.plm.system.mapper.ErpProcessReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 工艺资源—工序报工（对应 G3-N7b ERP 工艺资源—工序报工）：
 * 报工记录登记、分页查询与删除。
 * 报工单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProcessReportService {

    private static final String DEFAULT_REPORT_NO_PREFIX = "RPT";
    private static final String DEFAULT_REPORT_STATUS = "SUBMITTED";

    private final ErpProcessReportMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询报工记录：报工状态/计划单号/生产订单号精确，报工单号/计划单号/生产订单号/物料编码/报工人模糊，按主键倒序。 */
    public PageResult<ErpProcessReport> page(ErpProcessReportQuery query) {
        Page<ErpProcessReport> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProcessReport>lambdaQuery()
                .eq(StringUtils.hasText(query.getReportStatus()),
                        ErpProcessReport::getReportStatus, query.getReportStatus())
                .eq(StringUtils.hasText(query.getPlanNo()),
                        ErpProcessReport::getPlanNo, query.getPlanNo())
                .eq(StringUtils.hasText(query.getProductionOrderNo()),
                        ErpProcessReport::getProductionOrderNo, query.getProductionOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProcessReport::getReportNo, query.getKeyword()).or()
                        .like(ErpProcessReport::getPlanNo, query.getKeyword()).or()
                        .like(ErpProcessReport::getProductionOrderNo, query.getKeyword()).or()
                        .like(ErpProcessReport::getMaterialCode, query.getKeyword()).or()
                        .like(ErpProcessReport::getReporter, query.getKeyword()))
                .orderByDesc(ErpProcessReport::getId));
        return PageResult.of(page);
    }

    public ErpProcessReport detail(Long id) {
        return require(id);
    }

    /** 新增或更新报工记录：新增时回填默认报工状态/数量与组织，报工单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProcessReportSaveRequest request) {
        ErpProcessReport entity;
        if (id == null) {
            entity = new ErpProcessReport();
            entity.setReportNo(StringUtils.hasText(request.getReportNo())
                    ? request.getReportNo() : flowSupport.nextBizNo(DEFAULT_REPORT_NO_PREFIX));
            entity.setReportStatus(StringUtils.hasText(request.getReportStatus())
                    ? request.getReportStatus() : DEFAULT_REPORT_STATUS);
            entity.setQualifiedQty(request.getQualifiedQty() != null
                    ? request.getQualifiedQty() : BigDecimal.ZERO);
            entity.setUnqualifiedQty(request.getUnqualifiedQty() != null
                    ? request.getUnqualifiedQty() : BigDecimal.ZERO);
            entity.setScrapQty(request.getScrapQty() != null
                    ? request.getScrapQty() : BigDecimal.ZERO);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除报工记录：物理删除以释放报工单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProcessReport require(Long id) {
        ErpProcessReport entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工序报工不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProcessReport entity, ErpProcessReportSaveRequest request) {
        if (StringUtils.hasText(request.getReportNo())) {
            entity.setReportNo(request.getReportNo());
        }
        if (StringUtils.hasText(request.getPlanNo())) {
            entity.setPlanNo(request.getPlanNo());
        }
        if (StringUtils.hasText(request.getProductionOrderNo())) {
            entity.setProductionOrderNo(request.getProductionOrderNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (request.getOperationNo() != null) {
            entity.setOperationNo(request.getOperationNo());
        }
        if (request.getQualifiedQty() != null) {
            entity.setQualifiedQty(request.getQualifiedQty());
        }
        if (request.getUnqualifiedQty() != null) {
            entity.setUnqualifiedQty(request.getUnqualifiedQty());
        }
        if (request.getScrapQty() != null) {
            entity.setScrapQty(request.getScrapQty());
        }
        if (StringUtils.hasText(request.getReporter())) {
            entity.setReporter(request.getReporter());
        }
        if (request.getReportTime() != null) {
            entity.setReportTime(request.getReportTime());
        }
        if (StringUtils.hasText(request.getReportStatus())) {
            entity.setReportStatus(request.getReportStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
