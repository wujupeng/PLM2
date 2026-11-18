package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysGovAsisSystemQuery;
import com.huaweicloud.plm.system.dto.SysGovAsisSystemSaveRequest;
import com.huaweicloud.plm.system.entity.SysGovAsisSystem;
import com.huaweicloud.plm.system.mapper.SysGovAsisSystemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 存量系统（G1-N7 治理中心 T002 现状盘点）：
 * 系统现状登记、分页查询与删除。系统编号支持人工指定，删除语义为「释放编号」，采用物理删除。
 */
@Service
@RequiredArgsConstructor
public class SysGovAsisSystemService {

    private static final String DEFAULT_SYSTEM_TYPE = "OTHER";
    private static final String DEFAULT_SYSTEM_STATUS = "ACTIVE";

    private final SysGovAsisSystemMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询：类型/状态精确，编号/编码/名称/厂商模糊，按 id 倒序。 */
    public PageResult<SysGovAsisSystem> pageSystems(SysGovAsisSystemQuery query) {
        Page<SysGovAsisSystem> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysGovAsisSystem>lambdaQuery()
                .eq(StringUtils.hasText(query.getSystemType()),
                        SysGovAsisSystem::getSystemType, query.getSystemType())
                .eq(StringUtils.hasText(query.getSystemStatus()),
                        SysGovAsisSystem::getSystemStatus, query.getSystemStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysGovAsisSystem::getSystemNo, query.getKeyword()).or()
                        .like(SysGovAsisSystem::getSystemCode, query.getKeyword()).or()
                        .like(SysGovAsisSystem::getSystemName, query.getKeyword()).or()
                        .like(SysGovAsisSystem::getVendor, query.getKeyword()))
                .orderByDesc(SysGovAsisSystem::getId));
        return PageResult.of(page);
    }

    public SysGovAsisSystem detail(Long id) {
        return require(id);
    }

    /** 新增或更新：新增时回填默认类型/状态与组织，系统编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysGovAsisSystemSaveRequest request) {
        SysGovAsisSystem entity;
        if (id == null) {
            entity = new SysGovAsisSystem();
            entity.setSystemNo(StringUtils.hasText(request.getSystemNo())
                    ? request.getSystemNo() : flowSupport.nextBizNo("GAS"));
            entity.setSystemType(StringUtils.hasText(request.getSystemType())
                    ? request.getSystemType() : DEFAULT_SYSTEM_TYPE);
            entity.setSystemStatus(StringUtils.hasText(request.getSystemStatus())
                    ? request.getSystemStatus() : DEFAULT_SYSTEM_STATUS);
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

    /** 删除：物理删除以释放系统编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysGovAsisSystem require(Long id) {
        SysGovAsisSystem entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "存量系统不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非 null）时覆盖实体对应字段。 */
    private void applyRequest(SysGovAsisSystem entity, SysGovAsisSystemSaveRequest request) {
        if (StringUtils.hasText(request.getSystemNo())) {
            entity.setSystemNo(request.getSystemNo());
        }
        if (StringUtils.hasText(request.getSystemCode())) {
            entity.setSystemCode(request.getSystemCode());
        }
        if (StringUtils.hasText(request.getSystemName())) {
            entity.setSystemName(request.getSystemName());
        }
        if (StringUtils.hasText(request.getSystemType())) {
            entity.setSystemType(request.getSystemType());
        }
        if (StringUtils.hasText(request.getVendor())) {
            entity.setVendor(request.getVendor());
        }
        if (StringUtils.hasText(request.getDeployMode())) {
            entity.setDeployMode(request.getDeployMode());
        }
        if (request.getUserCount() != null) {
            entity.setUserCount(request.getUserCount());
        }
        if (StringUtils.hasText(request.getSystemStatus())) {
            entity.setSystemStatus(request.getSystemStatus());
        }
        if (StringUtils.hasText(request.getMigrateStrategy())) {
            entity.setMigrateStrategy(request.getMigrateStrategy());
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
