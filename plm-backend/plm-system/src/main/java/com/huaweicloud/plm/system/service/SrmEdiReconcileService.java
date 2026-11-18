package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmEdiReconcileQuery;
import com.huaweicloud.plm.system.dto.SrmEdiReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.SrmEdiReconcile;
import com.huaweicloud.plm.system.mapper.SrmEdiReconcileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM EDI 协同—EDI 对账（对应 EDI 对账）：
 * 对账单登记、分页查询与删除。
 * 对账单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmEdiReconcileService {

    private static final String DEFAULT_RECONCILE_NO_PREFIX = "ERN";
    private static final String DEFAULT_MESSAGE_TYPE = "ORDER";
    private static final String DEFAULT_RECONCILE_STATUS = "PENDING";
    private static final int DEFAULT_COUNT = 0;

    private final SrmEdiReconcileMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询 EDI 对账记录：报文类型/对账状态/合作方编码/对账周期精确，对账单号/合作方编码/合作方名称/对账周期模糊，按主键倒序。 */
    public PageResult<SrmEdiReconcile> page(SrmEdiReconcileQuery query) {
        Page<SrmEdiReconcile> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmEdiReconcile>lambdaQuery()
                .eq(StringUtils.hasText(query.getMessageType()),
                        SrmEdiReconcile::getMessageType, query.getMessageType())
                .eq(StringUtils.hasText(query.getReconcileStatus()),
                        SrmEdiReconcile::getReconcileStatus, query.getReconcileStatus())
                .eq(StringUtils.hasText(query.getPartnerCode()),
                        SrmEdiReconcile::getPartnerCode, query.getPartnerCode())
                .eq(StringUtils.hasText(query.getReconcilePeriod()),
                        SrmEdiReconcile::getReconcilePeriod, query.getReconcilePeriod())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmEdiReconcile::getReconcileNo, query.getKeyword()).or()
                        .like(SrmEdiReconcile::getPartnerCode, query.getKeyword()).or()
                        .like(SrmEdiReconcile::getPartnerName, query.getKeyword()).or()
                        .like(SrmEdiReconcile::getReconcilePeriod, query.getKeyword()))
                .orderByDesc(SrmEdiReconcile::getId));
        return PageResult.of(page);
    }

    public SrmEdiReconcile detail(Long id) {
        return require(id);
    }

    /** 新增或更新 EDI 对账记录：新增时回填默认报文类型、对账状态、计数字段与组织，对账单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmEdiReconcileSaveRequest request) {
        SrmEdiReconcile entity;
        if (id == null) {
            entity = new SrmEdiReconcile();
            entity.setReconcileNo(StringUtils.hasText(request.getReconcileNo())
                    ? request.getReconcileNo() : flowSupport.nextBizNo(DEFAULT_RECONCILE_NO_PREFIX));
            entity.setMessageType(StringUtils.hasText(request.getMessageType())
                    ? request.getMessageType() : DEFAULT_MESSAGE_TYPE);
            entity.setReconcileStatus(StringUtils.hasText(request.getReconcileStatus())
                    ? request.getReconcileStatus() : DEFAULT_RECONCILE_STATUS);
            entity.setSendCount(request.getSendCount() == null ? DEFAULT_COUNT : request.getSendCount());
            entity.setAckCount(request.getAckCount() == null ? DEFAULT_COUNT : request.getAckCount());
            entity.setFailCount(request.getFailCount() == null ? DEFAULT_COUNT : request.getFailCount());
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

    /** 删除 EDI 对账记录：物理删除以释放对账单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmEdiReconcile require(Long id) {
        SrmEdiReconcile entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "EDI对账单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、计数字段与日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmEdiReconcile entity, SrmEdiReconcileSaveRequest request) {
        if (StringUtils.hasText(request.getReconcileNo())) {
            entity.setReconcileNo(request.getReconcileNo());
        }
        if (StringUtils.hasText(request.getPartnerCode())) {
            entity.setPartnerCode(request.getPartnerCode());
        }
        if (StringUtils.hasText(request.getPartnerName())) {
            entity.setPartnerName(request.getPartnerName());
        }
        if (StringUtils.hasText(request.getReconcilePeriod())) {
            entity.setReconcilePeriod(request.getReconcilePeriod());
        }
        if (StringUtils.hasText(request.getMessageType())) {
            entity.setMessageType(request.getMessageType());
        }
        if (request.getSendCount() != null) {
            entity.setSendCount(request.getSendCount());
        }
        if (request.getAckCount() != null) {
            entity.setAckCount(request.getAckCount());
        }
        if (request.getFailCount() != null) {
            entity.setFailCount(request.getFailCount());
        }
        if (StringUtils.hasText(request.getReconcileResult())) {
            entity.setReconcileResult(request.getReconcileResult());
        }
        if (request.getReconcileDate() != null) {
            entity.setReconcileDate(request.getReconcileDate());
        }
        if (StringUtils.hasText(request.getReconcileStatus())) {
            entity.setReconcileStatus(request.getReconcileStatus());
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
