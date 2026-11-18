package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesInspectionJudgeQuery;
import com.huaweicloud.plm.system.dto.MesInspectionJudgeSaveRequest;
import com.huaweicloud.plm.system.entity.MesInspectionJudge;
import com.huaweicloud.plm.system.mapper.MesInspectionJudgeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 检验判定服务。
 */
@Service
@RequiredArgsConstructor
public class MesInspectionJudgeService {

    private static final String DEFAULT_NO_PREFIX = "MJG";
    private static final String DEFAULT_SOURCE_TYPE = "INCOMING";
    private static final String DEFAULT_JUDGE_RESULT = "PASS";
    private static final String DEFAULT_JUDGE_STATUS = "DRAFT";

    private final MesInspectionJudgeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesInspectionJudge> page(MesInspectionJudgeQuery query) {
        String keyword = query.getKeyword();
        Page<MesInspectionJudge> page = mapper.selectPage(query.toPage(), Wrappers.<MesInspectionJudge>lambdaQuery()
                .eq(StringUtils.hasText(query.getJudgeStatus()), MesInspectionJudge::getJudgeStatus, query.getJudgeStatus())
                .eq(StringUtils.hasText(query.getJudgeResult()), MesInspectionJudge::getJudgeResult, query.getJudgeResult())
                .eq(StringUtils.hasText(query.getSourceType()), MesInspectionJudge::getSourceType, query.getSourceType())
                .eq(StringUtils.hasText(query.getMaterialCode()), MesInspectionJudge::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesInspectionJudge::getJudgeNo, keyword).or()
                        .like(MesInspectionJudge::getSourceNo, keyword).or()
                        .like(MesInspectionJudge::getMaterialCode, keyword).or()
                        .like(MesInspectionJudge::getMaterialName, keyword))
                .orderByDesc(MesInspectionJudge::getId));
        return PageResult.of(page);
    }

    public MesInspectionJudge detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesInspectionJudgeSaveRequest request) {
        MesInspectionJudge entity;
        if (id == null) {
            entity = new MesInspectionJudge();
            entity.setJudgeNo(StringUtils.hasText(request.getJudgeNo())
                    ? request.getJudgeNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setSourceType(StringUtils.hasText(request.getSourceType())
                    ? request.getSourceType() : DEFAULT_SOURCE_TYPE);
            entity.setJudgeResult(StringUtils.hasText(request.getJudgeResult())
                    ? request.getJudgeResult() : DEFAULT_JUDGE_RESULT);
            entity.setJudgeStatus(StringUtils.hasText(request.getJudgeStatus())
                    ? request.getJudgeStatus() : DEFAULT_JUDGE_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private MesInspectionJudge require(Long id) {
        MesInspectionJudge entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "检验判定不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesInspectionJudge entity, MesInspectionJudgeSaveRequest request) {
        if (StringUtils.hasText(request.getJudgeNo())) {
            entity.setJudgeNo(request.getJudgeNo());
        }
        if (StringUtils.hasText(request.getSourceType())) {
            entity.setSourceType(request.getSourceType());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            entity.setBatchNo(request.getBatchNo());
        }
        if (StringUtils.hasText(request.getJudgeResult())) {
            entity.setJudgeResult(request.getJudgeResult());
        }
        if (StringUtils.hasText(request.getJudgeStatus())) {
            entity.setJudgeStatus(request.getJudgeStatus());
        }
        if (request.getJudgeQty() != null) {
            entity.setJudgeQty(request.getJudgeQty());
        }
        if (request.getQualifiedQty() != null) {
            entity.setQualifiedQty(request.getQualifiedQty());
        }
        if (request.getUnqualifiedQty() != null) {
            entity.setUnqualifiedQty(request.getUnqualifiedQty());
        }
        if (StringUtils.hasText(request.getJudgeOpinion())) {
            entity.setJudgeOpinion(request.getJudgeOpinion());
        }
        if (StringUtils.hasText(request.getDisposition())) {
            entity.setDisposition(request.getDisposition());
        }
        if (StringUtils.hasText(request.getJudgeBy())) {
            entity.setJudgeBy(request.getJudgeBy());
        }
        if (request.getJudgeTime() != null) {
            entity.setJudgeTime(request.getJudgeTime());
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
