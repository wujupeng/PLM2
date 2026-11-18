package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProcessResourceQuery;
import com.huaweicloud.plm.system.dto.ErpProcessResourceSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessResource;
import com.huaweicloud.plm.system.mapper.ErpProcessResourceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 工艺资源—资源资料（对应 G3-N7b ERP 工艺资源）：
 * 资源资料登记、分页查询与删除。
 * 资源编码由用户指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProcessResourceService {

    private static final String DEFAULT_RESOURCE_TYPE = "MACHINE";
    private static final String DEFAULT_RESOURCE_STATUS = "ACTIVE";

    private final ErpProcessResourceMapper mapper;

    /** 分页查询资源资料：资源类型/资源状态精确，资源编码/资源名称/工作中心/规格型号模糊，按主键倒序。 */
    public PageResult<ErpProcessResource> page(ErpProcessResourceQuery query) {
        Page<ErpProcessResource> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProcessResource>lambdaQuery()
                .eq(StringUtils.hasText(query.getResourceType()),
                        ErpProcessResource::getResourceType, query.getResourceType())
                .eq(StringUtils.hasText(query.getResourceStatus()),
                        ErpProcessResource::getResourceStatus, query.getResourceStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProcessResource::getResourceCode, query.getKeyword()).or()
                        .like(ErpProcessResource::getResourceName, query.getKeyword()).or()
                        .like(ErpProcessResource::getWorkCenter, query.getKeyword()).or()
                        .like(ErpProcessResource::getSpec, query.getKeyword()))
                .orderByDesc(ErpProcessResource::getId));
        return PageResult.of(page);
    }

    public ErpProcessResource detail(Long id) {
        return require(id);
    }

    /** 新增或更新资源资料：新增时回填默认资源类型/资源状态/产能与组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProcessResourceSaveRequest request) {
        ErpProcessResource entity;
        if (id == null) {
            entity = new ErpProcessResource();
            entity.setResourceType(StringUtils.hasText(request.getResourceType())
                    ? request.getResourceType() : DEFAULT_RESOURCE_TYPE);
            entity.setResourceStatus(StringUtils.hasText(request.getResourceStatus())
                    ? request.getResourceStatus() : DEFAULT_RESOURCE_STATUS);
            entity.setCapacity(request.getCapacity() != null
                    ? request.getCapacity() : BigDecimal.ZERO);
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

    /** 删除资源资料：物理删除以释放资源编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProcessResource require(Long id) {
        ErpProcessResource entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "资源资料不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProcessResource entity, ErpProcessResourceSaveRequest request) {
        if (StringUtils.hasText(request.getResourceCode())) {
            entity.setResourceCode(request.getResourceCode());
        }
        if (StringUtils.hasText(request.getResourceName())) {
            entity.setResourceName(request.getResourceName());
        }
        if (StringUtils.hasText(request.getResourceType())) {
            entity.setResourceType(request.getResourceType());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getResourceGroup())) {
            entity.setResourceGroup(request.getResourceGroup());
        }
        if (StringUtils.hasText(request.getWorkCenter())) {
            entity.setWorkCenter(request.getWorkCenter());
        }
        if (request.getCapacity() != null) {
            entity.setCapacity(request.getCapacity());
        }
        if (StringUtils.hasText(request.getCapacityUnit())) {
            entity.setCapacityUnit(request.getCapacityUnit());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (StringUtils.hasText(request.getResourceStatus())) {
            entity.setResourceStatus(request.getResourceStatus());
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
