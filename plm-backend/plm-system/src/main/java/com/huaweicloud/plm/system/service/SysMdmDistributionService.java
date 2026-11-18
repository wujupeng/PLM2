package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysMdmDistributionQuery;
import com.huaweicloud.plm.system.dto.SysMdmDistributionSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmDistribution;
import com.huaweicloud.plm.system.mapper.SysMdmDistributionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 主数据平台—主数据分发（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 主数据分发登记、分页查询与删除。
 * 分发编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMdmDistributionService {

    private static final String DEFAULT_DIST_TYPE = "FULL";
    private static final String DEFAULT_DIST_STATUS = "PENDING";
    private static final int DEFAULT_RETRY_COUNT = 0;

    private final SysMdmDistributionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询主数据分发：域/目标系统/状态/类型精确，编号/主数据编码模糊，按主键倒序。 */
    public PageResult<SysMdmDistribution> pageDistributions(SysMdmDistributionQuery query) {
        Page<SysMdmDistribution> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMdmDistribution>lambdaQuery()
                .eq(StringUtils.hasText(query.getDomainCode()),
                        SysMdmDistribution::getDomainCode, query.getDomainCode())
                .eq(StringUtils.hasText(query.getTargetSystem()),
                        SysMdmDistribution::getTargetSystem, query.getTargetSystem())
                .eq(StringUtils.hasText(query.getDistStatus()),
                        SysMdmDistribution::getDistStatus, query.getDistStatus())
                .eq(StringUtils.hasText(query.getDistType()),
                        SysMdmDistribution::getDistType, query.getDistType())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMdmDistribution::getDistNo, query.getKeyword()).or()
                        .like(SysMdmDistribution::getMasterCode, query.getKeyword()))
                .orderByDesc(SysMdmDistribution::getId));
        return PageResult.of(page);
    }

    public SysMdmDistribution detail(Long id) {
        return require(id);
    }

    /** 新增或更新主数据分发：新增时回填默认分发类型/状态/重试次数与组织，分发编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMdmDistributionSaveRequest request) {
        SysMdmDistribution entity;
        if (id == null) {
            entity = new SysMdmDistribution();
            entity.setDistNo(StringUtils.hasText(request.getDistNo())
                    ? request.getDistNo() : flowSupport.nextBizNo("MDT"));
            entity.setDistType(StringUtils.hasText(request.getDistType())
                    ? request.getDistType() : DEFAULT_DIST_TYPE);
            entity.setDistStatus(StringUtils.hasText(request.getDistStatus())
                    ? request.getDistStatus() : DEFAULT_DIST_STATUS);
            entity.setRetryCount(request.getRetryCount() != null
                    ? request.getRetryCount() : DEFAULT_RETRY_COUNT);
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

    /** 删除主数据分发：物理删除以释放分发编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMdmDistribution require(Long id) {
        SysMdmDistribution entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据分发不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysMdmDistribution entity, SysMdmDistributionSaveRequest request) {
        if (StringUtils.hasText(request.getDistNo())) {
            entity.setDistNo(request.getDistNo());
        }
        if (StringUtils.hasText(request.getDomainCode())) {
            entity.setDomainCode(request.getDomainCode());
        }
        if (StringUtils.hasText(request.getMasterCode())) {
            entity.setMasterCode(request.getMasterCode());
        }
        if (StringUtils.hasText(request.getTargetSystem())) {
            entity.setTargetSystem(request.getTargetSystem());
        }
        if (StringUtils.hasText(request.getDistType())) {
            entity.setDistType(request.getDistType());
        }
        if (StringUtils.hasText(request.getDistStatus())) {
            entity.setDistStatus(request.getDistStatus());
        }
        if (request.getDistTime() != null) {
            entity.setDistTime(request.getDistTime());
        }
        if (request.getAckTime() != null) {
            entity.setAckTime(request.getAckTime());
        }
        if (request.getRetryCount() != null) {
            entity.setRetryCount(request.getRetryCount());
        }
        if (StringUtils.hasText(request.getMessage())) {
            entity.setMessage(request.getMessage());
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
