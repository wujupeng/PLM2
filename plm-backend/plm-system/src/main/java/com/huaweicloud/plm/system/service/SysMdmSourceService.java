package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SysMdmSourceQuery;
import com.huaweicloud.plm.system.dto.SysMdmSourceSaveRequest;
import com.huaweicloud.plm.system.entity.SysMdmSource;
import com.huaweicloud.plm.system.mapper.SysMdmSourceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 主数据平台—权威源登记（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 权威源登记、分页查询与删除。
 * 源编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysMdmSourceService {

    private static final String DEFAULT_AUTHORITY_LEVEL = "PRIMARY";
    private static final String DEFAULT_SYNC_DIRECTION = "OUT";
    private static final String DEFAULT_SOURCE_STATUS = "ACTIVE";

    private final SysMdmSourceMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询权威源：域/源系统/权威级别/状态精确，编号/源实体模糊，按主键倒序。 */
    public PageResult<SysMdmSource> pageSources(SysMdmSourceQuery query) {
        Page<SysMdmSource> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysMdmSource>lambdaQuery()
                .eq(StringUtils.hasText(query.getDomainCode()),
                        SysMdmSource::getDomainCode, query.getDomainCode())
                .eq(StringUtils.hasText(query.getSourceSystem()),
                        SysMdmSource::getSourceSystem, query.getSourceSystem())
                .eq(StringUtils.hasText(query.getAuthorityLevel()),
                        SysMdmSource::getAuthorityLevel, query.getAuthorityLevel())
                .eq(StringUtils.hasText(query.getSourceStatus()),
                        SysMdmSource::getSourceStatus, query.getSourceStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysMdmSource::getSourceNo, query.getKeyword()).or()
                        .like(SysMdmSource::getSourceEntity, query.getKeyword()))
                .orderByDesc(SysMdmSource::getId));
        return PageResult.of(page);
    }

    public SysMdmSource detail(Long id) {
        return require(id);
    }

    /** 新增或更新权威源：新增时回填默认权威级别/同步方向/状态与组织，源编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysMdmSourceSaveRequest request) {
        SysMdmSource entity;
        if (id == null) {
            entity = new SysMdmSource();
            entity.setSourceNo(StringUtils.hasText(request.getSourceNo())
                    ? request.getSourceNo() : flowSupport.nextBizNo("MDS"));
            entity.setAuthorityLevel(StringUtils.hasText(request.getAuthorityLevel())
                    ? request.getAuthorityLevel() : DEFAULT_AUTHORITY_LEVEL);
            entity.setSyncDirection(StringUtils.hasText(request.getSyncDirection())
                    ? request.getSyncDirection() : DEFAULT_SYNC_DIRECTION);
            entity.setSourceStatus(StringUtils.hasText(request.getSourceStatus())
                    ? request.getSourceStatus() : DEFAULT_SOURCE_STATUS);
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

    /** 删除权威源：物理删除以释放源编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SysMdmSource require(Long id) {
        SysMdmSource entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "权威源登记不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空）时覆盖实体对应字段。 */
    private void applyRequest(SysMdmSource entity, SysMdmSourceSaveRequest request) {
        if (StringUtils.hasText(request.getSourceNo())) {
            entity.setSourceNo(request.getSourceNo());
        }
        if (StringUtils.hasText(request.getDomainCode())) {
            entity.setDomainCode(request.getDomainCode());
        }
        if (StringUtils.hasText(request.getSourceSystem())) {
            entity.setSourceSystem(request.getSourceSystem());
        }
        if (StringUtils.hasText(request.getSourceEntity())) {
            entity.setSourceEntity(request.getSourceEntity());
        }
        if (StringUtils.hasText(request.getAuthorityLevel())) {
            entity.setAuthorityLevel(request.getAuthorityLevel());
        }
        if (StringUtils.hasText(request.getSyncDirection())) {
            entity.setSyncDirection(request.getSyncDirection());
        }
        if (StringUtils.hasText(request.getSourceStatus())) {
            entity.setSourceStatus(request.getSourceStatus());
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
