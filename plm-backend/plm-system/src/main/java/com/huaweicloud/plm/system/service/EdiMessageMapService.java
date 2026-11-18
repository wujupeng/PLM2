package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiMessageMapQuery;
import com.huaweicloud.plm.system.dto.EdiMessageMapSaveRequest;
import com.huaweicloud.plm.system.entity.EdiMessageMap;
import com.huaweicloud.plm.system.mapper.EdiMessageMapMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * EDI 报文映射与标准化服务（N6，DEV-067）。
 */
@Service
@RequiredArgsConstructor
public class EdiMessageMapService {

    private static final String DEFAULT_PARTNER_CODE = "*";
    private static final String DEFAULT_STANDARD = "X12";
    private static final String DEFAULT_DIRECTION = "INBOUND";
    private static final String DEFAULT_SCOPE = "HEADER";
    private static final String DEFAULT_TRANSFORM_TYPE = "DIRECT";
    private static final int STATUS_ENABLED = 1;

    private final EdiMessageMapMapper ediMessageMapMapper;

    public PageResult<EdiMessageMap> page(EdiMessageMapQuery query) {
        Page<EdiMessageMap> page = query.toPage();
        ediMessageMapMapper.selectPage(page, Wrappers.<EdiMessageMap>lambdaQuery()
                .eq(StringUtils.hasText(query.getPartnerCode()), EdiMessageMap::getPartnerCode, query.getPartnerCode())
                .eq(StringUtils.hasText(query.getTransCode()), EdiMessageMap::getTransCode, query.getTransCode())
                .eq(StringUtils.hasText(query.getScope()), EdiMessageMap::getScope, query.getScope())
                .eq(StringUtils.hasText(query.getTransformType()), EdiMessageMap::getTransformType, query.getTransformType())
                .eq(query.getStatus() != null, EdiMessageMap::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiMessageMap::getMapCode, query.getKeyword()).or()
                        .like(EdiMessageMap::getMapName, query.getKeyword()))
                .orderByAsc(EdiMessageMap::getScope)
                .orderByAsc(EdiMessageMap::getSortNo));
        return PageResult.of(page);
    }

    public List<EdiMessageMap> listByTrans(String partnerCode, String transCode, String direction) {
        return ediMessageMapMapper.selectList(Wrappers.<EdiMessageMap>lambdaQuery()
                .eq(EdiMessageMap::getStatus, STATUS_ENABLED)
                .eq(EdiMessageMap::getTransCode, transCode)
                .eq(StringUtils.hasText(direction), EdiMessageMap::getDirection, direction)
                .and(StringUtils.hasText(partnerCode), w -> w
                        .eq(EdiMessageMap::getPartnerCode, partnerCode).or()
                        .eq(EdiMessageMap::getPartnerCode, DEFAULT_PARTNER_CODE))
                .orderByAsc(EdiMessageMap::getScope)
                .orderByAsc(EdiMessageMap::getSortNo));
    }

    public EdiMessageMap requireById(Long id) {
        EdiMessageMap messageMap = ediMessageMapMapper.selectById(id);
        if (messageMap == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "EDI 报文映射不存在: " + id);
        }
        return messageMap;
    }

    public Long create(EdiMessageMapSaveRequest request) {
        ensureUnique(request, -1L);
        EdiMessageMap messageMap = new EdiMessageMap();
        applyRequest(messageMap, request);
        ediMessageMapMapper.insert(messageMap);
        return messageMap.getId();
    }

    public void update(Long id, EdiMessageMapSaveRequest request) {
        EdiMessageMap messageMap = requireById(id);
        ensureUnique(request, id);
        applyRequest(messageMap, request);
        ediMessageMapMapper.updateById(messageMap);
    }

    public void delete(Long id) {
        requireById(id);
        ediMessageMapMapper.deleteById(id);
    }

    private void applyRequest(EdiMessageMap messageMap, EdiMessageMapSaveRequest request) {
        messageMap.setMapCode(request.getMapCode());
        messageMap.setMapName(request.getMapName());
        messageMap.setPartnerCode(StringUtils.hasText(request.getPartnerCode())
                ? request.getPartnerCode() : DEFAULT_PARTNER_CODE);
        messageMap.setTransCode(request.getTransCode());
        messageMap.setStandard(StringUtils.hasText(request.getStandard())
                ? request.getStandard() : DEFAULT_STANDARD);
        messageMap.setDirection(StringUtils.hasText(request.getDirection())
                ? request.getDirection() : DEFAULT_DIRECTION);
        messageMap.setScope(StringUtils.hasText(request.getScope())
                ? request.getScope() : DEFAULT_SCOPE);
        messageMap.setSourcePath(request.getSourcePath());
        messageMap.setTargetField(request.getTargetField());
        messageMap.setTransformType(StringUtils.hasText(request.getTransformType())
                ? request.getTransformType() : DEFAULT_TRANSFORM_TYPE);
        messageMap.setDictType(request.getDictType());
        messageMap.setDatePattern(request.getDatePattern());
        messageMap.setDefaultValue(request.getDefaultValue());
        messageMap.setRequiredFlag(request.getRequiredFlag() == null ? 0 : request.getRequiredFlag());
        messageMap.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        messageMap.setStatus(request.getStatus() == null ? STATUS_ENABLED : request.getStatus());
        messageMap.setRemark(request.getRemark());
    }

    private void ensureUnique(EdiMessageMapSaveRequest request, Long excludeId) {
        String partnerCode = StringUtils.hasText(request.getPartnerCode())
                ? request.getPartnerCode() : DEFAULT_PARTNER_CODE;
        String scope = StringUtils.hasText(request.getScope()) ? request.getScope() : DEFAULT_SCOPE;
        long count = ediMessageMapMapper.selectCount(Wrappers.<EdiMessageMap>lambdaQuery()
                .eq(EdiMessageMap::getPartnerCode, partnerCode)
                .eq(EdiMessageMap::getTransCode, request.getTransCode())
                .eq(EdiMessageMap::getMapCode, request.getMapCode())
                .eq(EdiMessageMap::getScope, scope)
                .eq(EdiMessageMap::getSourcePath, request.getSourcePath())
                .ne(excludeId != null && excludeId > 0, EdiMessageMap::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "EDI 报文映射已存在: "
                    + partnerCode + "/" + request.getTransCode() + "/" + request.getMapCode());
        }
    }
}
