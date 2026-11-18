package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmRectificationQuery;
import com.huaweicloud.plm.system.dto.SrmRectificationSaveRequest;
import com.huaweicloud.plm.system.entity.SrmRectification;
import com.huaweicloud.plm.system.mapper.SrmRectificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商质量—整改跟踪（对应整改跟踪）：
 * 整改单登记、分页查询与删除。
 * 整改单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmRectificationService {

    private static final String DEFAULT_RECTIFICATION_NO_PREFIX = "RCF";
    private static final String DEFAULT_RECTIFICATION_STATUS = "PENDING";

    private final SrmRectificationMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询整改跟踪记录：整改状态/供应商编码/来源单号精确，整改单号/来源单号/供应商编码/供应商名称/物料编码模糊，按主键倒序。 */
    public PageResult<SrmRectification> page(SrmRectificationQuery query) {
        Page<SrmRectification> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmRectification>lambdaQuery()
                .eq(StringUtils.hasText(query.getRectificationStatus()),
                        SrmRectification::getRectificationStatus, query.getRectificationStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmRectification::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getSourceNo()),
                        SrmRectification::getSourceNo, query.getSourceNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmRectification::getRectificationNo, query.getKeyword()).or()
                        .like(SrmRectification::getSourceNo, query.getKeyword()).or()
                        .like(SrmRectification::getSupplierCode, query.getKeyword()).or()
                        .like(SrmRectification::getSupplierName, query.getKeyword()).or()
                        .like(SrmRectification::getMaterialCode, query.getKeyword()))
                .orderByDesc(SrmRectification::getId));
        return PageResult.of(page);
    }

    public SrmRectification detail(Long id) {
        return require(id);
    }

    /** 新增或更新整改跟踪记录：新增时回填默认整改状态与组织，整改单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmRectificationSaveRequest request) {
        SrmRectification entity;
        if (id == null) {
            entity = new SrmRectification();
            entity.setRectificationNo(StringUtils.hasText(request.getRectificationNo())
                    ? request.getRectificationNo() : flowSupport.nextBizNo(DEFAULT_RECTIFICATION_NO_PREFIX));
            entity.setRectificationStatus(StringUtils.hasText(request.getRectificationStatus())
                    ? request.getRectificationStatus() : DEFAULT_RECTIFICATION_STATUS);
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

    /** 删除整改跟踪记录：物理删除以释放整改单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmRectification require(Long id) {
        SrmRectification entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "整改跟踪单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmRectification entity, SrmRectificationSaveRequest request) {
        if (StringUtils.hasText(request.getRectificationNo())) {
            entity.setRectificationNo(request.getRectificationNo());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
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
        if (StringUtils.hasText(request.getIssueDesc())) {
            entity.setIssueDesc(request.getIssueDesc());
        }
        if (StringUtils.hasText(request.getRectifyAction())) {
            entity.setRectifyAction(request.getRectifyAction());
        }
        if (StringUtils.hasText(request.getResponsible())) {
            entity.setResponsible(request.getResponsible());
        }
        if (request.getPlanDate() != null) {
            entity.setPlanDate(request.getPlanDate());
        }
        if (request.getCompleteDate() != null) {
            entity.setCompleteDate(request.getCompleteDate());
        }
        if (StringUtils.hasText(request.getVerifyBy())) {
            entity.setVerifyBy(request.getVerifyBy());
        }
        if (request.getVerifyDate() != null) {
            entity.setVerifyDate(request.getVerifyDate());
        }
        if (StringUtils.hasText(request.getVerifyResult())) {
            entity.setVerifyResult(request.getVerifyResult());
        }
        if (StringUtils.hasText(request.getRectificationStatus())) {
            entity.setRectificationStatus(request.getRectificationStatus());
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
