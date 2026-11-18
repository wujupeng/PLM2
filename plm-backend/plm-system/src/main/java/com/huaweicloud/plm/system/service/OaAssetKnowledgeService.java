package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizAssetKnowledgeSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaAssetRepairKnowledge;
import com.huaweicloud.plm.system.mapper.OaAssetRepairKnowledgeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 维修知识库（OA-DEV-079）：故障原因、维修措施、备件、费用经验沉淀，按资产类别与故障分类检索。
 */
@Service
@RequiredArgsConstructor
public class OaAssetKnowledgeService {

    private final OaAssetRepairKnowledgeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaAssetRepairKnowledge> page(OaBizFlowQuery query) {
        Page<OaAssetRepairKnowledge> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaAssetRepairKnowledge>lambdaQuery()
                .eq(StringUtils.hasText(query.getTypeCode()), OaAssetRepairKnowledge::getAssetCategory, query.getTypeCode())
                .eq(query.getOrgId() != null, OaAssetRepairKnowledge::getOrgId, query.getOrgId())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaAssetRepairKnowledge::getKnowledgeNo, query.getKeyword()).or()
                        .like(OaAssetRepairKnowledge::getFaultSymptom, query.getKeyword()).or()
                        .like(OaAssetRepairKnowledge::getFaultCause, query.getKeyword()).or()
                        .like(OaAssetRepairKnowledge::getKeyword, query.getKeyword()))
                .orderByDesc(OaAssetRepairKnowledge::getHitCount)
                .orderByDesc(OaAssetRepairKnowledge::getId));
        return PageResult.of(page);
    }

    /** 按资产与故障分类检索知识条目，并累计命中次数。 */
    @Transactional
    public List<OaAssetRepairKnowledge> search(String assetCategory, String keyword) {
        List<OaAssetRepairKnowledge> list = mapper.selectList(Wrappers.<OaAssetRepairKnowledge>lambdaQuery()
                .eq(StringUtils.hasText(assetCategory), OaAssetRepairKnowledge::getAssetCategory, assetCategory)
                .and(StringUtils.hasText(keyword), w -> w
                        .like(OaAssetRepairKnowledge::getFaultSymptom, keyword).or()
                        .like(OaAssetRepairKnowledge::getFaultCause, keyword).or()
                        .like(OaAssetRepairKnowledge::getSolution, keyword).or()
                        .like(OaAssetRepairKnowledge::getKeyword, keyword))
                .orderByDesc(OaAssetRepairKnowledge::getHitCount)
                .last("limit 50"));
        for (OaAssetRepairKnowledge knowledge : list) {
            knowledge.setHitCount((knowledge.getHitCount() == null ? 0 : knowledge.getHitCount()) + 1);
            mapper.updateById(knowledge);
        }
        return list;
    }

    public OaAssetRepairKnowledge detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizAssetKnowledgeSaveRequest request) {
        if (!StringUtils.hasText(request.getFaultSymptom())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "故障现象不能为空");
        }
        OaAssetRepairKnowledge entity;
        if (id == null) {
            entity = new OaAssetRepairKnowledge();
            entity.setKnowledgeNo(flowSupport.nextBizNo("KB"));
            entity.setOrgId(currentOrgId());
            entity.setHitCount(0);
        } else {
            entity = requireEntity(id);
        }
        entity.setAssetCategory(request.getAssetCategory());
        entity.setFaultType(request.getFaultType());
        entity.setFaultSymptom(request.getFaultSymptom());
        entity.setFaultCause(request.getFaultCause());
        entity.setSolution(request.getSolution());
        entity.setSpareParts(request.getSpareParts());
        entity.setReferenceCost(request.getReferenceCost());
        entity.setSourceRepairNo(request.getSourceRepairNo());
        entity.setKeyword(request.getKeyword());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireEntity(id);
        mapper.deleteById(id);
    }

    public OaAssetRepairKnowledge requireEntity(Long id) {
        OaAssetRepairKnowledge entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "维修知识条目不存在: " + id);
        }
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
