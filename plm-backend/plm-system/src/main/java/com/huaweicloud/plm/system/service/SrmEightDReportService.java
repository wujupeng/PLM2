package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmEightDReportQuery;
import com.huaweicloud.plm.system.dto.SrmEightDReportSaveRequest;
import com.huaweicloud.plm.system.entity.SrmEightDReport;
import com.huaweicloud.plm.system.mapper.SrmEightDReportMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商质量—8D 报告（对应 8D 报告）：
 * 报告登记、分页查询与删除。
 * 8D 编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmEightDReportService {

    private static final String DEFAULT_EIGHTD_NO_PREFIX = "E8D";
    private static final String DEFAULT_EIGHTD_STATUS = "DRAFT";

    private final SrmEightDReportMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询报告记录：报告状态/供应商编码/物料编码精确，8D 编号/供应商编码/供应商名称/问题描述/负责人模糊，按主键倒序。 */
    public PageResult<SrmEightDReport> page(SrmEightDReportQuery query) {
        Page<SrmEightDReport> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmEightDReport>lambdaQuery()
                .eq(StringUtils.hasText(query.getEightdStatus()),
                        SrmEightDReport::getEightdStatus, query.getEightdStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmEightDReport::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        SrmEightDReport::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmEightDReport::getEightdNo, query.getKeyword()).or()
                        .like(SrmEightDReport::getSupplierCode, query.getKeyword()).or()
                        .like(SrmEightDReport::getSupplierName, query.getKeyword()).or()
                        .like(SrmEightDReport::getProblemDesc, query.getKeyword()).or()
                        .like(SrmEightDReport::getOwner, query.getKeyword()))
                .orderByDesc(SrmEightDReport::getId));
        return PageResult.of(page);
    }

    public SrmEightDReport detail(Long id) {
        return require(id);
    }

    /** 新增或更新报告记录：新增时回填默认报告状态与组织，8D 编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmEightDReportSaveRequest request) {
        SrmEightDReport entity;
        if (id == null) {
            entity = new SrmEightDReport();
            entity.setEightdNo(StringUtils.hasText(request.getEightdNo())
                    ? request.getEightdNo() : flowSupport.nextBizNo(DEFAULT_EIGHTD_NO_PREFIX));
            entity.setEightdStatus(StringUtils.hasText(request.getEightdStatus())
                    ? request.getEightdStatus() : DEFAULT_EIGHTD_STATUS);
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

    /** 删除报告记录：物理删除以释放 8D 编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmEightDReport require(Long id) {
        SrmEightDReport entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "8D 报告不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmEightDReport entity, SrmEightDReportSaveRequest request) {
        if (StringUtils.hasText(request.getEightdNo())) {
            entity.setEightdNo(request.getEightdNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getProblemSource())) {
            entity.setProblemSource(request.getProblemSource());
        }
        if (StringUtils.hasText(request.getProblemDesc())) {
            entity.setProblemDesc(request.getProblemDesc());
        }
        if (StringUtils.hasText(request.getD1Team())) {
            entity.setD1Team(request.getD1Team());
        }
        if (StringUtils.hasText(request.getD2Problem())) {
            entity.setD2Problem(request.getD2Problem());
        }
        if (StringUtils.hasText(request.getD3Containment())) {
            entity.setD3Containment(request.getD3Containment());
        }
        if (StringUtils.hasText(request.getD4RootCause())) {
            entity.setD4RootCause(request.getD4RootCause());
        }
        if (StringUtils.hasText(request.getD5Corrective())) {
            entity.setD5Corrective(request.getD5Corrective());
        }
        if (StringUtils.hasText(request.getD6Implement())) {
            entity.setD6Implement(request.getD6Implement());
        }
        if (StringUtils.hasText(request.getD7Prevent())) {
            entity.setD7Prevent(request.getD7Prevent());
        }
        if (StringUtils.hasText(request.getD8Congratulate())) {
            entity.setD8Congratulate(request.getD8Congratulate());
        }
        if (request.getIssueDate() != null) {
            entity.setIssueDate(request.getIssueDate());
        }
        if (request.getCloseDate() != null) {
            entity.setCloseDate(request.getCloseDate());
        }
        if (StringUtils.hasText(request.getOwner())) {
            entity.setOwner(request.getOwner());
        }
        if (StringUtils.hasText(request.getEightdStatus())) {
            entity.setEightdStatus(request.getEightdStatus());
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
