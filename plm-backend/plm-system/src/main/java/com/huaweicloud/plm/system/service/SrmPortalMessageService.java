package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmPortalMessageQuery;
import com.huaweicloud.plm.system.dto.SrmPortalMessageSaveRequest;
import com.huaweicloud.plm.system.entity.SrmPortalMessage;
import com.huaweicloud.plm.system.mapper.SrmPortalMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 供应商门户—门户消息（对应门户消息）：
 * 门户消息登记、分页查询与删除。
 * 消息编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmPortalMessageService {

    private static final String DEFAULT_MESSAGE_NO_PREFIX = "PMS";
    private static final String DEFAULT_MESSAGE_TYPE = "SYSTEM";
    private static final String DEFAULT_MESSAGE_STATUS = "DRAFT";
    private static final int DEFAULT_READ_FLAG = 0;

    private final SrmPortalMessageMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询门户消息记录：消息类型/消息状态/供应商编码/已读标志精确，消息编号/供应商编码/供应商名称/消息标题/关联业务单号模糊，按主键倒序。 */
    public PageResult<SrmPortalMessage> page(SrmPortalMessageQuery query) {
        Page<SrmPortalMessage> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmPortalMessage>lambdaQuery()
                .eq(StringUtils.hasText(query.getMessageType()),
                        SrmPortalMessage::getMessageType, query.getMessageType())
                .eq(StringUtils.hasText(query.getMessageStatus()),
                        SrmPortalMessage::getMessageStatus, query.getMessageStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        SrmPortalMessage::getSupplierCode, query.getSupplierCode())
                .eq(query.getReadFlag() != null,
                        SrmPortalMessage::getReadFlag, query.getReadFlag())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmPortalMessage::getMessageNo, query.getKeyword()).or()
                        .like(SrmPortalMessage::getSupplierCode, query.getKeyword()).or()
                        .like(SrmPortalMessage::getSupplierName, query.getKeyword()).or()
                        .like(SrmPortalMessage::getTitle, query.getKeyword()).or()
                        .like(SrmPortalMessage::getBizNo, query.getKeyword()))
                .orderByDesc(SrmPortalMessage::getId));
        return PageResult.of(page);
    }

    public SrmPortalMessage detail(Long id) {
        return require(id);
    }

    /** 新增或更新门户消息记录：新增时回填默认消息类型、消息状态、已读标志与组织，消息编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmPortalMessageSaveRequest request) {
        SrmPortalMessage entity;
        if (id == null) {
            entity = new SrmPortalMessage();
            entity.setMessageNo(StringUtils.hasText(request.getMessageNo())
                    ? request.getMessageNo() : flowSupport.nextBizNo(DEFAULT_MESSAGE_NO_PREFIX));
            entity.setMessageType(StringUtils.hasText(request.getMessageType())
                    ? request.getMessageType() : DEFAULT_MESSAGE_TYPE);
            entity.setMessageStatus(StringUtils.hasText(request.getMessageStatus())
                    ? request.getMessageStatus() : DEFAULT_MESSAGE_STATUS);
            entity.setReadFlag(request.getReadFlag() != null ? request.getReadFlag() : DEFAULT_READ_FLAG);
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

    /** 删除门户消息记录：物理删除以释放消息编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmPortalMessage require(Long id) {
        SrmPortalMessage entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "门户消息不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、整数与日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmPortalMessage entity, SrmPortalMessageSaveRequest request) {
        if (StringUtils.hasText(request.getMessageNo())) {
            entity.setMessageNo(request.getMessageNo());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getMessageType())) {
            entity.setMessageType(request.getMessageType());
        }
        if (StringUtils.hasText(request.getTitle())) {
            entity.setTitle(request.getTitle());
        }
        if (StringUtils.hasText(request.getContent())) {
            entity.setContent(request.getContent());
        }
        if (StringUtils.hasText(request.getBizNo())) {
            entity.setBizNo(request.getBizNo());
        }
        if (request.getReadFlag() != null) {
            entity.setReadFlag(request.getReadFlag());
        }
        if (StringUtils.hasText(request.getSender())) {
            entity.setSender(request.getSender());
        }
        if (request.getSendDate() != null) {
            entity.setSendDate(request.getSendDate());
        }
        if (StringUtils.hasText(request.getMessageStatus())) {
            entity.setMessageStatus(request.getMessageStatus());
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
