package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesTraceCodeQuery;
import com.huaweicloud.plm.system.dto.MesTraceCodeSaveRequest;
import com.huaweicloud.plm.system.entity.MesTraceCode;
import com.huaweicloud.plm.system.mapper.MesTraceCodeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 追溯码服务。
 */
@Service
@RequiredArgsConstructor
public class MesTraceCodeService {

    private static final String DEFAULT_NO_PREFIX = "MDM";
    private static final String DEFAULT_CODE_TYPE = "DATAMATRIX";
    private static final String DEFAULT_CODE_STATUS = "INACTIVE";
    private static final String DEFAULT_OBJECT_TYPE = "SERIAL";

    private final MesTraceCodeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesTraceCode> page(MesTraceCodeQuery query) {
        String keyword = query.getKeyword();
        Page<MesTraceCode> page = mapper.selectPage(query.toPage(), Wrappers.<MesTraceCode>lambdaQuery()
                .eq(StringUtils.hasText(query.getCodeType()), MesTraceCode::getCodeType, query.getCodeType())
                .eq(StringUtils.hasText(query.getCodeStatus()), MesTraceCode::getCodeStatus, query.getCodeStatus())
                .eq(StringUtils.hasText(query.getObjectType()), MesTraceCode::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getObjectCode()), MesTraceCode::getObjectCode, query.getObjectCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesTraceCode::getCodeNo, keyword).or()
                        .like(MesTraceCode::getCodeContent, keyword).or()
                        .like(MesTraceCode::getObjectCode, keyword))
                .orderByDesc(MesTraceCode::getId));
        return PageResult.of(page);
    }

    public MesTraceCode detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesTraceCodeSaveRequest request) {
        MesTraceCode entity;
        if (id == null) {
            entity = new MesTraceCode();
            entity.setCodeNo(StringUtils.hasText(request.getCodeNo())
                    ? request.getCodeNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setCodeType(StringUtils.hasText(request.getCodeType())
                    ? request.getCodeType() : DEFAULT_CODE_TYPE);
            entity.setCodeStatus(StringUtils.hasText(request.getCodeStatus())
                    ? request.getCodeStatus() : DEFAULT_CODE_STATUS);
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
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

    private MesTraceCode require(Long id) {
        MesTraceCode entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "追溯码不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesTraceCode entity, MesTraceCodeSaveRequest request) {
        if (StringUtils.hasText(request.getCodeNo())) {
            entity.setCodeNo(request.getCodeNo());
        }
        if (StringUtils.hasText(request.getCodeType())) {
            entity.setCodeType(request.getCodeType());
        }
        if (StringUtils.hasText(request.getCodeStatus())) {
            entity.setCodeStatus(request.getCodeStatus());
        }
        if (StringUtils.hasText(request.getCodeContent())) {
            entity.setCodeContent(request.getCodeContent());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (StringUtils.hasText(request.getObjectCode())) {
            entity.setObjectCode(request.getObjectCode());
        }
        if (request.getPrintTime() != null) {
            entity.setPrintTime(request.getPrintTime());
        }
        if (request.getPrintCount() != null) {
            entity.setPrintCount(request.getPrintCount());
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
