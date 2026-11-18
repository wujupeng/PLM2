package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmPortalAttachmentQuery;
import com.huaweicloud.plm.system.dto.SrmPortalAttachmentSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPortalAttachment;
import com.huaweicloud.plm.system.mapper.SrmPortalAttachmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商门户—门户附件（对应门户附件）：
 * 附件登记、分页查询与删除。
 * 附件编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmPortalAttachmentService {

    private static final String DEFAULT_ATTACHMENT_NO_PREFIX = "PAT";
    private static final String DEFAULT_BIZ_TYPE = "MESSAGE";
    private static final String DEFAULT_ATTACHMENT_STATUS = "PENDING";

    private final SrmPortalAttachmentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询门户附件记录：业务类型/附件状态/供应商编码/关联业务单号精确，附件编号/关联业务单号/文件名/供应商编码/供应商名称模糊，按主键倒序。 */
    public PageResult<SrmPortalAttachment> page(SrmPortalAttachmentQuery query) {
        Page<SrmPortalAttachment> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmPortalAttachment>lambdaQuery()
                .eq(StringUtils.hasText(query.getBizType()),
                        SrmPortalAttachment::getBizType, query.getBizType())
                .eq(StringUtils.hasText(query.getAttachmentStatus()),
                        SrmPortalAttachment::getAttachmentStatus, query.getAttachmentStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmPortalAttachment::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getBizNo()),
                        SrmPortalAttachment::getBizNo, query.getBizNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmPortalAttachment::getAttachmentNo, query.getKeyword()).or()
                        .like(SrmPortalAttachment::getBizNo, query.getKeyword()).or()
                        .like(SrmPortalAttachment::getFileName, query.getKeyword()).or()
                        .like(SrmPortalAttachment::getSupplierCode, query.getKeyword()).or()
                        .like(SrmPortalAttachment::getSupplierName, query.getKeyword()))
                .orderByDesc(SrmPortalAttachment::getId));
        return PageResult.of(page);
    }

    public SrmPortalAttachment detail(Long id) {
        return require(id);
    }

    /** 新增或更新门户附件记录：新增时回填默认业务类型、默认附件状态与组织，附件编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmPortalAttachmentSaveRequest request) {
        SrmPortalAttachment entity;
        if (id == null) {
            entity = new SrmPortalAttachment();
            entity.setAttachmentNo(StringUtils.hasText(request.getAttachmentNo())
                    ? request.getAttachmentNo() : flowSupport.nextBizNo(DEFAULT_ATTACHMENT_NO_PREFIX));
            entity.setBizType(StringUtils.hasText(request.getBizType())
                    ? request.getBizType() : DEFAULT_BIZ_TYPE);
            entity.setAttachmentStatus(StringUtils.hasText(request.getAttachmentStatus())
                    ? request.getAttachmentStatus() : DEFAULT_ATTACHMENT_STATUS);
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

    /** 删除门户附件记录：物理删除以释放附件编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmPortalAttachment require(Long id) {
        SrmPortalAttachment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "门户附件不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmPortalAttachment entity, SrmPortalAttachmentSaveRequest request) {
        if (StringUtils.hasText(request.getAttachmentNo())) {
            entity.setAttachmentNo(request.getAttachmentNo());
        }
        if (StringUtils.hasText(request.getBizType())) {
            entity.setBizType(request.getBizType());
        }
        if (StringUtils.hasText(request.getBizNo())) {
            entity.setBizNo(request.getBizNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getFileName())) {
            entity.setFileName(request.getFileName());
        }
        if (StringUtils.hasText(request.getFilePath())) {
            entity.setFilePath(request.getFilePath());
        }
        if (StringUtils.hasText(request.getFileType())) {
            entity.setFileType(request.getFileType());
        }
        if (request.getFileSize() != null) {
            entity.setFileSize(request.getFileSize());
        }
        if (StringUtils.hasText(request.getUploader())) {
            entity.setUploader(request.getUploader());
        }
        if (request.getUploadDate() != null) {
            entity.setUploadDate(request.getUploadDate());
        }
        if (StringUtils.hasText(request.getAttachmentStatus())) {
            entity.setAttachmentStatus(request.getAttachmentStatus());
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
