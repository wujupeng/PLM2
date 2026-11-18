package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysMdmDomainQuery;
import com.huaweicloud.plm.system.dto.SysMdmDomainSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmDomain;
import com.huaweicloud.plm.system.mapper.SysMdmDomainMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 主数据平台—主数据域（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 主数据域登记、分页查询与删除。
 * 域编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMdmDomainService {

    private static final String DEFAULT_MASTER_TYPE = "MATERIAL";
    private static final String DEFAULT_AUTHORITY_SYSTEM = "PLM";
    private static final String DEFAULT_SYNC_MODE = "PUSH";
    private static final String DEFAULT_DOMAIN_STATUS = "ACTIVE";

    private final SysMdmDomainMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询主数据域：类型/状态精确，编号/编码/名称模糊，按主键倒序。 */
    public PageResult<SysMdmDomain> pageDomains(SysMdmDomainQuery query) {
        Page<SysMdmDomain> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMdmDomain>lambdaQuery()
                .eq(StringUtils.hasText(query.getMasterType()),
                        SysMdmDomain::getMasterType, query.getMasterType())
                .eq(StringUtils.hasText(query.getDomainStatus()),
                        SysMdmDomain::getDomainStatus, query.getDomainStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMdmDomain::getDomainNo, query.getKeyword()).or()
                        .like(SysMdmDomain::getDomainCode, query.getKeyword()).or()
                        .like(SysMdmDomain::getDomainName, query.getKeyword()))
                .orderByDesc(SysMdmDomain::getId));
        return PageResult.of(page);
    }

    public SysMdmDomain detail(Long id) {
        return require(id);
    }

    /** 新增或更新主数据域：新增时回填默认类型/权威源/同步方式/状态与组织，域编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMdmDomainSaveRequest request) {
        SysMdmDomain entity;
        if (id == null) {
            entity = new SysMdmDomain();
            entity.setDomainNo(StringUtils.hasText(request.getDomainNo())
                    ? request.getDomainNo() : flowSupport.nextBizNo("MDD"));
            entity.setMasterType(StringUtils.hasText(request.getMasterType())
                    ? request.getMasterType() : DEFAULT_MASTER_TYPE);
            entity.setAuthoritySystem(StringUtils.hasText(request.getAuthoritySystem())
                    ? request.getAuthoritySystem() : DEFAULT_AUTHORITY_SYSTEM);
            entity.setSyncMode(StringUtils.hasText(request.getSyncMode())
                    ? request.getSyncMode() : DEFAULT_SYNC_MODE);
            entity.setDomainStatus(StringUtils.hasText(request.getDomainStatus())
                    ? request.getDomainStatus() : DEFAULT_DOMAIN_STATUS);
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

    /** 删除主数据域：物理删除以释放域编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMdmDomain require(Long id) {
        SysMdmDomain entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "主数据域不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysMdmDomain entity, SysMdmDomainSaveRequest request) {
        if (StringUtils.hasText(request.getDomainNo())) {
            entity.setDomainNo(request.getDomainNo());
        }
        if (StringUtils.hasText(request.getDomainCode())) {
            entity.setDomainCode(request.getDomainCode());
        }
        if (StringUtils.hasText(request.getDomainName())) {
            entity.setDomainName(request.getDomainName());
        }
        if (StringUtils.hasText(request.getMasterType())) {
            entity.setMasterType(request.getMasterType());
        }
        if (StringUtils.hasText(request.getAuthoritySystem())) {
            entity.setAuthoritySystem(request.getAuthoritySystem());
        }
        if (StringUtils.hasText(request.getOwnerDept())) {
            entity.setOwnerDept(request.getOwnerDept());
        }
        if (StringUtils.hasText(request.getSyncMode())) {
            entity.setSyncMode(request.getSyncMode());
        }
        if (StringUtils.hasText(request.getDomainStatus())) {
            entity.setDomainStatus(request.getDomainStatus());
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
