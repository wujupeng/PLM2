package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierAssessmentQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierAssessmentSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierAssessment;
import com.huaweicloud.plm.system.mapper.SrmSupplierAssessmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商质量—供应商考评（对应供应商考评）：
 * 考评登记、分页查询与删除。
 * 考评单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierAssessmentService {

    private static final String DEFAULT_ASSESSMENT_NO_PREFIX = "ASM";
    private static final String DEFAULT_ASSESSMENT_TYPE = "MONTHLY";
    private static final String DEFAULT_ASSESSMENT_STATUS = "DRAFT";

    private final SrmSupplierAssessmentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询考评记录：考评类型/考评状态/供应商编码精确，考评单号/供应商编码/供应商名称/考评周期/考评人模糊，按主键倒序。 */
    public PageResult<SrmSupplierAssessment> page(SrmSupplierAssessmentQuery query) {
        Page<SrmSupplierAssessment> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplierAssessment>lambdaQuery()
                .eq(StringUtils.hasText(query.getAssessmentType()),
                        SrmSupplierAssessment::getAssessmentType, query.getAssessmentType())
                .eq(StringUtils.hasText(query.getAssessmentStatus()),
                        SrmSupplierAssessment::getAssessmentStatus, query.getAssessmentStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmSupplierAssessment::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplierAssessment::getAssessmentNo, query.getKeyword()).or()
                        .like(SrmSupplierAssessment::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplierAssessment::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplierAssessment::getAssessmentPeriod, query.getKeyword()).or()
                        .like(SrmSupplierAssessment::getAssessor, query.getKeyword()))
                .orderByDesc(SrmSupplierAssessment::getId));
        return PageResult.of(page);
    }

    public SrmSupplierAssessment detail(Long id) {
        return require(id);
    }

    /** 新增或更新考评记录：新增时回填默认考评类型/考评状态与组织，考评单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierAssessmentSaveRequest request) {
        SrmSupplierAssessment entity;
        if (id == null) {
            entity = new SrmSupplierAssessment();
            entity.setAssessmentNo(StringUtils.hasText(request.getAssessmentNo())
                    ? request.getAssessmentNo() : flowSupport.nextBizNo(DEFAULT_ASSESSMENT_NO_PREFIX));
            entity.setAssessmentType(StringUtils.hasText(request.getAssessmentType())
                    ? request.getAssessmentType() : DEFAULT_ASSESSMENT_TYPE);
            entity.setAssessmentStatus(StringUtils.hasText(request.getAssessmentStatus())
                    ? request.getAssessmentStatus() : DEFAULT_ASSESSMENT_STATUS);
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

    /** 删除考评记录：物理删除以释放考评单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplierAssessment require(Long id) {
        SrmSupplierAssessment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商考评单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplierAssessment entity, SrmSupplierAssessmentSaveRequest request) {
        if (StringUtils.hasText(request.getAssessmentNo())) {
            entity.setAssessmentNo(request.getAssessmentNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getAssessmentPeriod())) {
            entity.setAssessmentPeriod(request.getAssessmentPeriod());
        }
        if (StringUtils.hasText(request.getAssessmentType())) {
            entity.setAssessmentType(request.getAssessmentType());
        }
        if (request.getQualityScore() != null) {
            entity.setQualityScore(request.getQualityScore());
        }
        if (request.getDeliveryScore() != null) {
            entity.setDeliveryScore(request.getDeliveryScore());
        }
        if (request.getPriceScore() != null) {
            entity.setPriceScore(request.getPriceScore());
        }
        if (request.getServiceScore() != null) {
            entity.setServiceScore(request.getServiceScore());
        }
        if (request.getTotalScore() != null) {
            entity.setTotalScore(request.getTotalScore());
        }
        if (StringUtils.hasText(request.getGradeLevel())) {
            entity.setGradeLevel(request.getGradeLevel());
        }
        if (StringUtils.hasText(request.getAssessmentResult())) {
            entity.setAssessmentResult(request.getAssessmentResult());
        }
        if (StringUtils.hasText(request.getAssessor())) {
            entity.setAssessor(request.getAssessor());
        }
        if (request.getAssessDate() != null) {
            entity.setAssessDate(request.getAssessDate());
        }
        if (StringUtils.hasText(request.getAssessmentStatus())) {
            entity.setAssessmentStatus(request.getAssessmentStatus());
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
