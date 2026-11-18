package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MesCollectRecordQuery;
import com.huaweicloud.plm.system.dto.MesCollectRecordSaveRequest;
import com.huaweicloud.plm.system.entity.MesCollectRecord;
import com.huaweicloud.plm.system.mapper.MesCollectRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 采集数据记录服务。
 */
@Service
@RequiredArgsConstructor
public class MesCollectRecordService {

    private static final String DEFAULT_NO_PREFIX = "MCS";
    private static final String DEFAULT_QUALITY_FLAG = "VALID";
    private static final String DEFAULT_VALIDATE_STATUS = "PENDING";

    private final MesCollectRecordMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<MesCollectRecord> page(MesCollectRecordQuery query) {
        String keyword = query.getKeyword();
        Page<MesCollectRecord> page = mapper.selectPage(query.toPage(), Wrappers.<MesCollectRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getValidateStatus()), MesCollectRecord::getValidateStatus, query.getValidateStatus())
                .eq(StringUtils.hasText(query.getQualityFlag()), MesCollectRecord::getQualityFlag, query.getQualityFlag())
                .eq(StringUtils.hasText(query.getDeviceCode()), MesCollectRecord::getDeviceCode, query.getDeviceCode())
                .eq(StringUtils.hasText(query.getPointCode()), MesCollectRecord::getPointCode, query.getPointCode())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MesCollectRecord::getRecordNo, keyword).or()
                        .like(MesCollectRecord::getDeviceCode, keyword).or()
                        .like(MesCollectRecord::getPointCode, keyword).or()
                        .like(MesCollectRecord::getCollectValue, keyword))
                .orderByDesc(MesCollectRecord::getId));
        return PageResult.of(page);
    }

    public MesCollectRecord detail(Long id) {
        return require(id);
    }

    public Long save(Long id, MesCollectRecordSaveRequest request) {
        MesCollectRecord entity;
        if (id == null) {
            entity = new MesCollectRecord();
            entity.setRecordNo(StringUtils.hasText(request.getRecordNo())
                    ? request.getRecordNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setQualityFlag(StringUtils.hasText(request.getQualityFlag())
                    ? request.getQualityFlag() : DEFAULT_QUALITY_FLAG);
            entity.setValidateStatus(StringUtils.hasText(request.getValidateStatus())
                    ? request.getValidateStatus() : DEFAULT_VALIDATE_STATUS);
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

    private MesCollectRecord require(Long id) {
        MesCollectRecord entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "采集数据记录不存在: " + id);
        }
        return entity;
    }

    private void applyRequest(MesCollectRecord entity, MesCollectRecordSaveRequest request) {
        if (StringUtils.hasText(request.getRecordNo())) {
            entity.setRecordNo(request.getRecordNo());
        }
        if (StringUtils.hasText(request.getDeviceCode())) {
            entity.setDeviceCode(request.getDeviceCode());
        }
        if (StringUtils.hasText(request.getInterfaceNo())) {
            entity.setInterfaceNo(request.getInterfaceNo());
        }
        if (StringUtils.hasText(request.getPointCode())) {
            entity.setPointCode(request.getPointCode());
        }
        if (StringUtils.hasText(request.getCollectValue())) {
            entity.setCollectValue(request.getCollectValue());
        }
        if (StringUtils.hasText(request.getDataType())) {
            entity.setDataType(request.getDataType());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (request.getCollectTime() != null) {
            entity.setCollectTime(request.getCollectTime());
        }
        if (request.getReceiveTime() != null) {
            entity.setReceiveTime(request.getReceiveTime());
        }
        if (StringUtils.hasText(request.getQualityFlag())) {
            entity.setQualityFlag(request.getQualityFlag());
        }
        if (StringUtils.hasText(request.getValidateStatus())) {
            entity.setValidateStatus(request.getValidateStatus());
        }
        if (StringUtils.hasText(request.getValidateMessage())) {
            entity.setValidateMessage(request.getValidateMessage());
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
