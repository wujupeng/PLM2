package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesEquipmentCheckQuery;
import com.huaweicloud.plm.system.dto.MesEquipmentCheckSaveRequest;
import com.huaweicloud.plm.system.entity.MesEquipmentCheck;
import com.huaweicloud.plm.system.mapper.MesEquipmentCheckMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 设备点检记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesEquipmentCheckService {

    private static final String DEFAULT_NO_PREFIX = "MEC";
    private static final String DEFAULT_CHECK_TYPE = "DAILY";
    private static final String DEFAULT_CHECK_RESULT = "PASS";
    private static final String DEFAULT_CHECK_STATUS = "PENDING";

    private final MesEquipmentCheckMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesEquipmentCheck> page(MesEquipmentCheckQuery query) {
        String keyword = query.getKeyword();
        Page<MesEquipmentCheck> page = mapper.selectPage(query.toPage(), Wrappers.<MesEquipmentCheck>lambdaQuery()
                .eq(StringUtils.hasText(query.getCheckType()), MesEquipmentCheck::getCheckType, query.getCheckType())
                .eq(StringUtils.hasText(query.getCheckStatus()), MesEquipmentCheck::getCheckStatus, query.getCheckStatus())
                .eq(StringUtils.hasText(query.getCheckResult()), MesEquipmentCheck::getCheckResult, query.getCheckResult())
                .eq(StringUtils.hasText(query.getEquipmentCode()), MesEquipmentCheck::getEquipmentCode, query.getEquipmentCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesEquipmentCheck::getCheckNo, keyword).or()
                        .like(MesEquipmentCheck::getEquipmentCode, keyword).or()
                        .like(MesEquipmentCheck::getEquipmentName, keyword).or()
                        .like(MesEquipmentCheck::getInspector, keyword))
                .orderByDesc(MesEquipmentCheck::getId));
        return PageResult.of(page);
    }

    public MesEquipmentCheck detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesEquipmentCheckSaveRequest request) {
        MesEquipmentCheck entity;
        if (id == null) {
            entity = new MesEquipmentCheck();
            entity.setCheckNo(StringUtils.hasText(request.getCheckNo())
                    ? request.getCheckNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setCheckType(StringUtils.hasText(request.getCheckType())
                    ? request.getCheckType() : DEFAULT_CHECK_TYPE);
            entity.setCheckResult(StringUtils.hasText(request.getCheckResult())
                    ? request.getCheckResult() : DEFAULT_CHECK_RESULT);
            entity.setCheckStatus(StringUtils.hasText(request.getCheckStatus())
                    ? request.getCheckStatus() : DEFAULT_CHECK_STATUS);
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

    private MesEquipmentCheck require(Long id) {
        MesEquipmentCheck entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "设备点检记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesEquipmentCheck entity, MesEquipmentCheckSaveRequest request) {
        if (StringUtils.hasText(request.getCheckNo())) {
            entity.setCheckNo(request.getCheckNo());
        }
        if (StringUtils.hasText(request.getEquipmentCode())) {
            entity.setEquipmentCode(request.getEquipmentCode());
        }
        if (StringUtils.hasText(request.getEquipmentName())) {
            entity.setEquipmentName(request.getEquipmentName());
        }
        if (StringUtils.hasText(request.getCheckType())) {
            entity.setCheckType(request.getCheckType());
        }
        if (StringUtils.hasText(request.getCheckItem())) {
            entity.setCheckItem(request.getCheckItem());
        }
        if (StringUtils.hasText(request.getCheckResult())) {
            entity.setCheckResult(request.getCheckResult());
        }
        if (StringUtils.hasText(request.getCheckStatus())) {
            entity.setCheckStatus(request.getCheckStatus());
        }
        if (StringUtils.hasText(request.getInspector())) {
            entity.setInspector(request.getInspector());
        }
        if (request.getCheckTime() != null) {
            entity.setCheckTime(request.getCheckTime());
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
