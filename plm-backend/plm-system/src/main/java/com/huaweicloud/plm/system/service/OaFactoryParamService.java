package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizFactoryParamSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaFactoryParam;
import com.huaweicloud.plm.system.mapper.OaFactoryParamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 多工厂参数（OA-DEV-084）：工厂级时区、区域与参数键值，按组织隔离。
 * 默认工厂编码取自可配置项 oa.factory.default.code。
 */
@Service
@RequiredArgsConstructor
public class OaFactoryParamService {

    private final OaFactoryParamMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaFactoryParam> page(OaBizFlowQuery query) {
        Page<OaFactoryParam> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaFactoryParam>lambdaQuery()
                .eq(query.getOrgId() != null, OaFactoryParam::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaFactoryParam::getFactoryCode, query.getTypeCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaFactoryParam::getFactoryCode, query.getKeyword()).or()
                        .like(OaFactoryParam::getFactoryName, query.getKeyword()).or()
                        .like(OaFactoryParam::getParamKey, query.getKeyword()))
                .orderByAsc(OaFactoryParam::getFactoryCode)
                .orderByAsc(OaFactoryParam::getParamKey));
        return PageResult.of(page);
    }

    /** 按工厂查询参数列表，未指定则取默认工厂。 */
    public List<OaFactoryParam> listByFactory(String factoryCode) {
        String code = StringUtils.hasText(factoryCode) ? factoryCode
                : flowSupport.configString("oa.factory.default.code", "DEFAULT");
        return mapper.selectList(Wrappers.<OaFactoryParam>lambdaQuery()
                .eq(OaFactoryParam::getFactoryCode, code)
                .orderByAsc(OaFactoryParam::getParamKey));
    }

    public OaFactoryParam detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizFactoryParamSaveRequest request) {
        if (!StringUtils.hasText(request.getFactoryCode()) || !StringUtils.hasText(request.getParamKey())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "工厂编码与参数键不能为空");
        }
        OaFactoryParam entity;
        if (id == null) {
            entity = new OaFactoryParam();
            entity.setOrgId(currentOrgId());
            entity.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        } else {
            entity = requireEntity(id);
        }
        entity.setFactoryCode(request.getFactoryCode());
        entity.setFactoryName(request.getFactoryName());
        entity.setCountryCode(request.getCountryCode());
        entity.setTimezone(StringUtils.hasText(request.getTimezone()) ? request.getTimezone() : "Asia/Shanghai");
        entity.setLocaleCode(StringUtils.hasText(request.getLocaleCode()) ? request.getLocaleCode()
                : flowSupport.configString("oa.i18n.default.locale", "zh-CN"));
        entity.setParamKey(request.getParamKey());
        entity.setParamValue(request.getParamValue());
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
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

    public OaFactoryParam requireEntity(Long id) {
        OaFactoryParam entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工厂参数不存在: " + id);
        }
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
