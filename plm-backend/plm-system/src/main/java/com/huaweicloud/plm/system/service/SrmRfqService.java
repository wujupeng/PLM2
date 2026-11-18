package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmRfqQuery;
import com.huaweicloud.plm.system.dto.SrmRfqSaveRequest;
import com.huaweicloud.plm.system.entity.SrmRfq;
import com.huaweicloud.plm.system.mapper.SrmRfqMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM 寻源与询报价—询价单（对应询价单）：
 * 询价单登记、分页查询与删除。
 * 询价单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmRfqService {

    private static final String DEFAULT_RFQ_NO_PREFIX = "RFQ";
    private static final String DEFAULT_RFQ_TYPE = "INVITED";
    private static final String DEFAULT_RFQ_STATUS = "DRAFT";
    private static final Integer DEFAULT_INVITE_COUNT = 0;
    private static final Integer DEFAULT_QUOTE_COUNT = 0;

    private final SrmRfqMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询询价单：询价方式/询价状态/关联寻源单号精确，询价单号/询价标题/物料编码/物料名称/采购员模糊，按主键倒序。 */
    public PageResult<SrmRfq> page(SrmRfqQuery query) {
        Page<SrmRfq> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmRfq>lambdaQuery()
                .eq(StringUtils.hasText(query.getRfqType()),
                        SrmRfq::getRfqType, query.getRfqType())
                .eq(StringUtils.hasText(query.getRfqStatus()),
                        SrmRfq::getRfqStatus, query.getRfqStatus())
                .eq(StringUtils.hasText(query.getSourcingNo()),
                        SrmRfq::getSourcingNo, query.getSourcingNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmRfq::getRfqNo, query.getKeyword()).or()
                        .like(SrmRfq::getRfqTitle, query.getKeyword()).or()
                        .like(SrmRfq::getMaterialCode, query.getKeyword()).or()
                        .like(SrmRfq::getMaterialName, query.getKeyword()).or()
                        .like(SrmRfq::getBuyer, query.getKeyword()))
                .orderByDesc(SrmRfq::getId));
        return PageResult.of(page);
    }

    public SrmRfq detail(Long id) {
        return require(id);
    }

    /** 新增或更新询价单：新增时回填默认询价方式/询价状态/邀请与已报价数及组织，询价单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmRfqSaveRequest request) {
        SrmRfq entity;
        if (id == null) {
            entity = new SrmRfq();
            entity.setRfqNo(StringUtils.hasText(request.getRfqNo())
                    ? request.getRfqNo() : flowSupport.nextBizNo(DEFAULT_RFQ_NO_PREFIX));
            entity.setRfqType(StringUtils.hasText(request.getRfqType())
                    ? request.getRfqType() : DEFAULT_RFQ_TYPE);
            entity.setRfqStatus(StringUtils.hasText(request.getRfqStatus())
                    ? request.getRfqStatus() : DEFAULT_RFQ_STATUS);
            entity.setInviteCount(DEFAULT_INVITE_COUNT);
            entity.setQuoteCount(DEFAULT_QUOTE_COUNT);
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

    /** 删除询价单：物理删除以释放询价单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmRfq require(Long id) {
        SrmRfq entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "询价单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmRfq entity, SrmRfqSaveRequest request) {
        if (StringUtils.hasText(request.getRfqNo())) {
            entity.setRfqNo(request.getRfqNo());
        }
        if (StringUtils.hasText(request.getRfqTitle())) {
            entity.setRfqTitle(request.getRfqTitle());
        }
        if (StringUtils.hasText(request.getSourcingNo())) {
            entity.setSourcingNo(request.getSourcingNo());
        }
        if (StringUtils.hasText(request.getRfqType())) {
            entity.setRfqType(request.getRfqType());
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
        if (request.getRfqQty() != null) {
            entity.setRfqQty(request.getRfqQty());
        }
        if (StringUtils.hasText(request.getUnit())) {
            entity.setUnit(request.getUnit());
        }
        if (request.getPublishDate() != null) {
            entity.setPublishDate(request.getPublishDate());
        }
        if (request.getDeadlineDate() != null) {
            entity.setDeadlineDate(request.getDeadlineDate());
        }
        if (request.getInviteCount() != null) {
            entity.setInviteCount(request.getInviteCount());
        }
        if (request.getQuoteCount() != null) {
            entity.setQuoteCount(request.getQuoteCount());
        }
        if (StringUtils.hasText(request.getBuyer())) {
            entity.setBuyer(request.getBuyer());
        }
        if (StringUtils.hasText(request.getRfqStatus())) {
            entity.setRfqStatus(request.getRfqStatus());
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
