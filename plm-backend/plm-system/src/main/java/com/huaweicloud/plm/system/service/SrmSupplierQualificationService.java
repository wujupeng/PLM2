package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmSupplierQualificationQuery;
import com.huaweicloud.plm.system.dto.SrmSupplierQualificationSaveRequest;
import com.huaweicloud.plm.system.entity.SrmSupplierQualification;
import com.huaweicloud.plm.system.mapper.SrmSupplierQualificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商资质：
 * 资质记录登记、分页查询与删除。
 * 资质编号支持人工指定，删除语义为「释放编号」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmSupplierQualificationService {

    private static final String DEFAULT_QUALIFICATION_NO_PREFIX = "QLF";
    private static final String DEFAULT_QUALIFICATION_TYPE = "BUSINESS_LICENSE";
    private static final String DEFAULT_QUALIFICATION_STATUS = "VALID";

    private final SrmSupplierQualificationMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询供应商资质：资质类型/资质状态/供应商编码精确，资质编号/供应商编码/供应商名称/证书编号模糊，按主键倒序。 */
    public PageResult<SrmSupplierQualification> page(SrmSupplierQualificationQuery query) {
        Page<SrmSupplierQualification> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmSupplierQualification>lambdaQuery()
                .eq(StringUtils.hasText(query.getQualificationType()),
                        SrmSupplierQualification::getQualificationType, query.getQualificationType())
                .eq(StringUtils.hasText(query.getQualificationStatus()),
                        SrmSupplierQualification::getQualificationStatus, query.getQualificationStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmSupplierQualification::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmSupplierQualification::getQualificationNo, query.getKeyword()).or()
                        .like(SrmSupplierQualification::getSupplierCode, query.getKeyword()).or()
                        .like(SrmSupplierQualification::getSupplierName, query.getKeyword()).or()
                        .like(SrmSupplierQualification::getCertNo, query.getKeyword()))
                .orderByDesc(SrmSupplierQualification::getId));
        return PageResult.of(page);
    }

    public SrmSupplierQualification detail(Long id) {
        return require(id);
    }

    /** 新增或更新供应商资质：新增时回填默认资质类型/资质状态与组织，资质编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmSupplierQualificationSaveRequest request) {
        SrmSupplierQualification entity;
        if (id == null) {
            entity = new SrmSupplierQualification();
            entity.setQualificationNo(StringUtils.hasText(request.getQualificationNo())
                    ? request.getQualificationNo() : flowSupport.nextBizNo(DEFAULT_QUALIFICATION_NO_PREFIX));
            entity.setQualificationType(StringUtils.hasText(request.getQualificationType())
                    ? request.getQualificationType() : DEFAULT_QUALIFICATION_TYPE);
            entity.setQualificationStatus(StringUtils.hasText(request.getQualificationStatus())
                    ? request.getQualificationStatus() : DEFAULT_QUALIFICATION_STATUS);
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

    /** 删除供应商资质：物理删除以释放资质编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmSupplierQualification require(Long id) {
        SrmSupplierQualification entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "供应商资质记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmSupplierQualification entity, SrmSupplierQualificationSaveRequest request) {
        if (StringUtils.hasText(request.getQualificationNo())) {
            entity.setQualificationNo(request.getQualificationNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getQualificationType())) {
            entity.setQualificationType(request.getQualificationType());
        }
        if (StringUtils.hasText(request.getQualificationName())) {
            entity.setQualificationName(request.getQualificationName());
        }
        if (StringUtils.hasText(request.getCertNo())) {
            entity.setCertNo(request.getCertNo());
        }
        if (StringUtils.hasText(request.getIssueAuthority())) {
            entity.setIssueAuthority(request.getIssueAuthority());
        }
        if (request.getIssueDate() != null) {
            entity.setIssueDate(request.getIssueDate());
        }
        if (request.getExpireDate() != null) {
            entity.setExpireDate(request.getExpireDate());
        }
        if (StringUtils.hasText(request.getAttachmentUrl())) {
            entity.setAttachmentUrl(request.getAttachmentUrl());
        }
        if (StringUtils.hasText(request.getQualificationStatus())) {
            entity.setQualificationStatus(request.getQualificationStatus());
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
