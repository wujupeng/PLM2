package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierGradeQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierGradeSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierGrade;
import com.huaweicloud.plm.system.mapper.SrmSupplierGradeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商管理—供应商分级：
 * 分级记录登记、分页查询与删除。
 * 分级单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierGradeService {

    private static final String DEFAULT_GRADE_NO_PREFIX = "GRD";
    private static final String DEFAULT_GRADE_LEVEL = "C";
    private static final String DEFAULT_GRADE_STATUS = "DRAFT";

    private final SrmSupplierGradeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询分级记录：分级等级/分级状态/供应商编码精确，分级单号/供应商编码/供应商名称/评价人模糊，按主键倒序。 */
    public PageResult<SrmSupplierGrade> page(SrmSupplierGradeQuery query) {
        Page<SrmSupplierGrade> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplierGrade>lambdaQuery()
                .eq(StringUtils.hasText(query.getGradeLevel()),
                        SrmSupplierGrade::getGradeLevel, query.getGradeLevel())
                .eq(StringUtils.hasText(query.getGradeStatus()),
                        SrmSupplierGrade::getGradeStatus, query.getGradeStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmSupplierGrade::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplierGrade::getGradeNo, query.getKeyword()).or()
                        .like(SrmSupplierGrade::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplierGrade::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplierGrade::getEvaluator, query.getKeyword()))
                .orderByDesc(SrmSupplierGrade::getId));
        return PageResult.of(page);
    }

    public SrmSupplierGrade detail(Long id) {
        return require(id);
    }

    /** 新增或更新分级记录：新增时回填默认分级等级/分级状态与组织，分级单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierGradeSaveRequest request) {
        SrmSupplierGrade entity;
        if (id == null) {
            entity = new SrmSupplierGrade();
            entity.setGradeNo(StringUtils.hasText(request.getGradeNo())
                    ? request.getGradeNo() : flowSupport.nextBizNo(DEFAULT_GRADE_NO_PREFIX));
            entity.setGradeLevel(StringUtils.hasText(request.getGradeLevel())
                    ? request.getGradeLevel() : DEFAULT_GRADE_LEVEL);
            entity.setGradeStatus(StringUtils.hasText(request.getGradeStatus())
                    ? request.getGradeStatus() : DEFAULT_GRADE_STATUS);
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

    /** 删除分级记录：物理删除以释放分级单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplierGrade require(Long id) {
        SrmSupplierGrade entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商分级记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplierGrade entity, SrmSupplierGradeSaveRequest request) {
        if (StringUtils.hasText(request.getGradeNo())) {
            entity.setGradeNo(request.getGradeNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getGradeLevel())) {
            entity.setGradeLevel(request.getGradeLevel());
        }
        if (StringUtils.hasText(request.getGradePeriod())) {
            entity.setGradePeriod(request.getGradePeriod());
        }
        if (request.getGradeScore() != null) {
            entity.setGradeScore(request.getGradeScore());
        }
        if (StringUtils.hasText(request.getGradeBasis())) {
            entity.setGradeBasis(request.getGradeBasis());
        }
        if (StringUtils.hasText(request.getEvaluator())) {
            entity.setEvaluator(request.getEvaluator());
        }
        if (request.getGradeDate() != null) {
            entity.setGradeDate(request.getGradeDate());
        }
        if (StringUtils.hasText(request.getGradeStatus())) {
            entity.setGradeStatus(request.getGradeStatus());
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
