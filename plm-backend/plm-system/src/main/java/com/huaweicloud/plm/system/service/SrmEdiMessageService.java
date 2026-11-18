package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmEdiMessageQuery;
import com.huaweicloud.plm.system.dto.SrmEdiMessageSaveRequest;
import com.huaweicloud.plm.system.entity.SrmEdiMessage;
import com.huaweicloud.plm.system.mapper.SrmEdiMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM EDI 协同—EDI 报文（对应 EDI 报文）：
 * EDI 报文登记、分页查询与删除。
 * EDI 报文编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmEdiMessageService {

    private static final String DEFAULT_EDI_NO_PREFIX = "EDI";
    private static final String DEFAULT_DIRECTION = "OUTBOUND";
    private static final String DEFAULT_MESSAGE_TYPE = "ORDER";
    private static final String DEFAULT_MESSAGE_FORMAT = "XML";
    private static final String DEFAULT_ACK_STATUS = "DRAFT";
    private static final String DEFAULT_MESSAGE_STATUS = "DRAFT";
    private static final int DEFAULT_RETRY_COUNT = 0;

    private final SrmEdiMessageMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询 EDI 报文记录：方向/报文类型/报文状态/合作方编码精确，EDI 报文编号/合作方编码/合作方名称/关联业务单号模糊，按主键倒序。 */
    public PageResult<SrmEdiMessage> page(SrmEdiMessageQuery query) {
        Page<SrmEdiMessage> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmEdiMessage>lambdaQuery()
                .eq(StringUtils.hasText(query.getDirection()),
                        SrmEdiMessage::getDirection, query.getDirection())
                .eq(StringUtils.hasText(query.getMessageType()),
                        SrmEdiMessage::getMessageType, query.getMessageType())
                .eq(StringUtils.hasText(query.getMessageStatus()),
                        SrmEdiMessage::getMessageStatus, query.getMessageStatus())
                .eq(StringUtils.hasText(query.getPartnerCode()),
                        SrmEdiMessage::getPartnerCode, query.getPartnerCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmEdiMessage::getEdiNo, query.getKeyword()).or()
                        .like(SrmEdiMessage::getPartnerCode, query.getKeyword()).or()
                        .like(SrmEdiMessage::getPartnerName, query.getKeyword()).or()
                        .like(SrmEdiMessage::getBizNo, query.getKeyword()))
                .orderByDesc(SrmEdiMessage::getId));
        return PageResult.of(page);
    }

    public SrmEdiMessage detail(Long id) {
        return require(id);
    }

    /** 新增或更新 EDI 报文记录：新增时回填默认编号、方向、报文类型、报文格式、回执状态、报文状态、重试次数与组织，EDI 报文编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmEdiMessageSaveRequest request) {
        SrmEdiMessage entity;
        if (id == null) {
            entity = new SrmEdiMessage();
            entity.setEdiNo(StringUtils.hasText(request.getEdiNo())
                    ? request.getEdiNo() : flowSupport.nextBizNo(DEFAULT_EDI_NO_PREFIX));
            entity.setDirection(StringUtils.hasText(request.getDirection())
                    ? request.getDirection() : DEFAULT_DIRECTION);
            entity.setMessageType(StringUtils.hasText(request.getMessageType())
                    ? request.getMessageType() : DEFAULT_MESSAGE_TYPE);
            entity.setMessageFormat(StringUtils.hasText(request.getMessageFormat())
                    ? request.getMessageFormat() : DEFAULT_MESSAGE_FORMAT);
            entity.setAckStatus(StringUtils.hasText(request.getAckStatus())
                    ? request.getAckStatus() : DEFAULT_ACK_STATUS);
            entity.setMessageStatus(StringUtils.hasText(request.getMessageStatus())
                    ? request.getMessageStatus() : DEFAULT_MESSAGE_STATUS);
            entity.setRetryCount(request.getRetryCount() != null
                    ? request.getRetryCount() : DEFAULT_RETRY_COUNT);
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

    /** 删除 EDI 报文记录：物理删除以释放 EDI 报文编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmEdiMessage require(Long id) {
        SrmEdiMessage entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "EDI报文不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、时间非空、重试次数非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmEdiMessage entity, SrmEdiMessageSaveRequest request) {
        if (StringUtils.hasText(request.getEdiNo())) {
            entity.setEdiNo(request.getEdiNo());
        }
        if (StringUtils.hasText(request.getPartnerCode())) {
            entity.setPartnerCode(request.getPartnerCode());
        }
        if (StringUtils.hasText(request.getPartnerName())) {
            entity.setPartnerName(request.getPartnerName());
        }
        if (StringUtils.hasText(request.getDirection())) {
            entity.setDirection(request.getDirection());
        }
        if (StringUtils.hasText(request.getMessageType())) {
            entity.setMessageType(request.getMessageType());
        }
        if (StringUtils.hasText(request.getBizNo())) {
            entity.setBizNo(request.getBizNo());
        }
        if (StringUtils.hasText(request.getMessageFormat())) {
            entity.setMessageFormat(request.getMessageFormat());
        }
        if (StringUtils.hasText(request.getPayload())) {
            entity.setPayload(request.getPayload());
        }
        if (request.getSendTime() != null) {
            entity.setSendTime(request.getSendTime());
        }
        if (StringUtils.hasText(request.getAckStatus())) {
            entity.setAckStatus(request.getAckStatus());
        }
        if (request.getAckTime() != null) {
            entity.setAckTime(request.getAckTime());
        }
        if (StringUtils.hasText(request.getAckCode())) {
            entity.setAckCode(request.getAckCode());
        }
        if (request.getRetryCount() != null) {
            entity.setRetryCount(request.getRetryCount());
        }
        if (request.getLastRetryTime() != null) {
            entity.setLastRetryTime(request.getLastRetryTime());
        }
        if (request.getNextRetryTime() != null) {
            entity.setNextRetryTime(request.getNextRetryTime());
        }
        if (StringUtils.hasText(request.getMessageStatus())) {
            entity.setMessageStatus(request.getMessageStatus());
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
