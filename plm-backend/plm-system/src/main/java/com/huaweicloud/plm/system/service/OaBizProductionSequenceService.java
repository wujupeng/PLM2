package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizProductionSequenceSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizProductionSequence;
import com.huaweicloud.plm.system.entity.OaBizProductionSequenceItem;
import com.huaweicloud.plm.system.mapper.OaBizProductionSequenceItemMapper;
import com.huaweicloud.plm.system.mapper.OaBizProductionSequenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 生产顺序表（OA-DEV-065）：顺序表维护与发布协同。
 * 排产权威归属系统为可配置项（oa.biz.production.sequence.authority，默认 MES），
 * OA 不覆盖 MES 已发布生产计划，仅承载维护与车间查询协同。
 */
@Service
@RequiredArgsConstructor
public class OaBizProductionSequenceService {

    private static final String STATUS_DRAFT = "DRAFT";

    private static final String STATUS_PUBLISHED = "PUBLISHED";

    private static final String STATUS_CLOSED = "CLOSED";

    private final OaBizProductionSequenceMapper mapper;
    private final OaBizProductionSequenceItemMapper itemMapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaBizProductionSequence> page(OaBizFlowQuery query) {
        Page<OaBizProductionSequence> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizProductionSequence>lambdaQuery()
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizProductionSequence::getSeqStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizProductionSequence::getOrgId, query.getOrgId())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizProductionSequence::getSequenceNo, query.getKeyword()).or()
                        .like(OaBizProductionSequence::getSequenceName, query.getKeyword()).or()
                        .like(OaBizProductionSequence::getWorkshop, query.getKeyword()))
                .orderByDesc(OaBizProductionSequence::getId));
        return PageResult.of(page);
    }

    public OaBizProductionSequence detail(Long id) {
        return requireEntity(id);
    }

    /** 顺序表明细行。 */
    public List<OaBizProductionSequenceItem> listItems(Long sequenceId) {
        requireEntity(sequenceId);
        return itemMapper.selectList(Wrappers.<OaBizProductionSequenceItem>lambdaQuery()
                .eq(OaBizProductionSequenceItem::getSequenceId, sequenceId)
                .orderByAsc(OaBizProductionSequenceItem::getLineNo)
                .orderByAsc(OaBizProductionSequenceItem::getId));
    }

    @Transactional
    public Long save(Long id, BizProductionSequenceSaveRequest request) {
        OaBizProductionSequence entity;
        if (id == null) {
            entity = new OaBizProductionSequence();
            entity.setSequenceNo(flowSupport.nextBizNo("PS"));
            entity.setOrgId(currentOrgId());
            entity.setOrgName(null);
            entity.setSeqStatus(STATUS_DRAFT);
            entity.setItemCount(0);
        } else {
            entity = requireEntity(id);
            if (STATUS_CLOSED.equals(entity.getSeqStatus())) {
                throw new BusinessException(ResultCode.CONFLICT, "已关闭的生产顺序表不可修改");
            }
        }
        validate(request);
        entity.setSequenceName(request.getSequenceName());
        entity.setSequenceVersion(request.getSequenceVersion() == null ? 1 : request.getSequenceVersion());
        entity.setPlanPeriod(request.getPlanPeriod());
        entity.setWorkshop(request.getWorkshop());
        entity.setPlanSource(StringUtils.hasText(request.getPlanSource()) ? request.getPlanSource()
                : flowSupport.configString("oa.biz.production.sequence.authority", "OA"));
        entity.setOwnerUserId(request.getOwnerUserId());
        entity.setOwnerName(request.getOwnerName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        saveItems(entity.getId(), request.getItems());
        return entity.getId();
    }

    /** 发布：仅草稿可发布，车间可查询已发布的顺序表（受可配置项控制）。 */
    @Transactional
    public void publish(Long id) {
        OaBizProductionSequence entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getSeqStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的生产顺序表可发布");
        }
        entity.setSeqStatus(STATUS_PUBLISHED);
        entity.setPublishTime(LocalDateTime.now());
        entity.setPublisherUserId(UserContext.getUserId());
        UserContext.Principal principal = UserContext.get();
        entity.setPublisherName(principal == null ? null : principal.displayName());
        mapper.updateById(entity);
    }

    @Transactional
    public void close(Long id) {
        OaBizProductionSequence entity = requireEntity(id);
        if (STATUS_CLOSED.equals(entity.getSeqStatus())) {
            return;
        }
        entity.setSeqStatus(STATUS_CLOSED);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizProductionSequence entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getSeqStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的生产顺序表可删除");
        }
        itemMapper.delete(Wrappers.<OaBizProductionSequenceItem>lambdaQuery()
                .eq(OaBizProductionSequenceItem::getSequenceId, id));
        mapper.deleteById(id);
    }

    public OaBizProductionSequence requireEntity(Long id) {
        OaBizProductionSequence entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产顺序表不存在: " + id);
        }
        return entity;
    }

    private void saveItems(Long sequenceId, List<BizProductionSequenceSaveRequest.Item> items) {
        itemMapper.delete(Wrappers.<OaBizProductionSequenceItem>lambdaQuery()
                .eq(OaBizProductionSequenceItem::getSequenceId, sequenceId));
        int lineNo = 1;
        if (items != null) {
            for (BizProductionSequenceSaveRequest.Item item : items) {
                OaBizProductionSequenceItem row = new OaBizProductionSequenceItem();
                row.setSequenceId(sequenceId);
                row.setLineNo(lineNo++);
                row.setOrderNo(item.getOrderNo());
                row.setMaterialCode(item.getMaterialCode());
                row.setMaterialName(item.getMaterialName());
                row.setPlanQty(item.getPlanQty());
                row.setPlanStart(item.getPlanStart());
                row.setPlanEnd(item.getPlanEnd());
                row.setWorkstation(item.getWorkstation());
                row.setPriorityNo(item.getPriorityNo());
                row.setRemark(item.getRemark());
                itemMapper.insert(row);
            }
        }
        OaBizProductionSequence entity = mapper.selectById(sequenceId);
        if (entity != null) {
            entity.setItemCount(items == null ? 0 : items.size());
            mapper.updateById(entity);
        }
    }

    private void validate(BizProductionSequenceSaveRequest request) {
        if (!StringUtils.hasText(request.getSequenceName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "生产顺序表名称不能为空");
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
