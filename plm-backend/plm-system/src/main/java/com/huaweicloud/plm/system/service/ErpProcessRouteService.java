package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProcessRouteQuery;
import com.huaweicloud.plm.system.dto.ErpProcessRouteSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessRoute;
import com.huaweicloud.plm.system.mapper.ErpProcessRouteMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 工艺资源—工艺路线（对应 G3-N7b ERP 工艺资源—工艺路线）：
 * 工艺路线的登记、分页查询与删除。
 * 工艺路线编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProcessRouteService {

    private static final String DEFAULT_ROUTE_TYPE = "MAIN";
    private static final String DEFAULT_ROUTE_STATUS = "DRAFT";
    private static final String DEFAULT_VERSION_NO = "V1.0";

    private final ErpProcessRouteMapper mapper;

    /** 分页查询工艺路线：路线类型/路线状态/物料编码精确，路线编码/名称/物料编码/物料名称模糊，按主键倒序。 */
    public PageResult<ErpProcessRoute> page(ErpProcessRouteQuery query) {
        Page<ErpProcessRoute> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProcessRoute>lambdaQuery()
                .eq(StringUtils.hasText(query.getRouteType()),
                        ErpProcessRoute::getRouteType, query.getRouteType())
                .eq(StringUtils.hasText(query.getRouteStatus()),
                        ErpProcessRoute::getRouteStatus, query.getRouteStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpProcessRoute::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProcessRoute::getRouteCode, query.getKeyword()).or()
                        .like(ErpProcessRoute::getRouteName, query.getKeyword()).or()
                        .like(ErpProcessRoute::getMaterialCode, query.getKeyword()).or()
                        .like(ErpProcessRoute::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpProcessRoute::getId));
        return PageResult.of(page);
    }

    public ErpProcessRoute detail(Long id) {
        return require(id);
    }

    /** 新增或更新工艺路线：新增时回填默认路线类型/状态/版本/工序数与组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProcessRouteSaveRequest request) {
        ErpProcessRoute entity;
        if (id == null) {
            entity = new ErpProcessRoute();
            entity.setRouteType(StringUtils.hasText(request.getRouteType())
                    ? request.getRouteType() : DEFAULT_ROUTE_TYPE);
            entity.setRouteStatus(StringUtils.hasText(request.getRouteStatus())
                    ? request.getRouteStatus() : DEFAULT_ROUTE_STATUS);
            entity.setVersionNo(StringUtils.hasText(request.getVersionNo())
                    ? request.getVersionNo() : DEFAULT_VERSION_NO);
            entity.setOperationCount(request.getOperationCount() != null
                    ? request.getOperationCount() : 0);
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

    /** 删除工艺路线：物理删除以释放工艺路线编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProcessRoute require(Long id) {
        ErpProcessRoute entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工艺路线不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProcessRoute entity, ErpProcessRouteSaveRequest request) {
        if (StringUtils.hasText(request.getRouteCode())) {
            entity.setRouteCode(request.getRouteCode());
        }
        if (StringUtils.hasText(request.getRouteName())) {
            entity.setRouteName(request.getRouteName());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getVersionNo())) {
            entity.setVersionNo(request.getVersionNo());
        }
        if (StringUtils.hasText(request.getRouteType())) {
            entity.setRouteType(request.getRouteType());
        }
        if (StringUtils.hasText(request.getRouteStatus())) {
            entity.setRouteStatus(request.getRouteStatus());
        }
        if (request.getOperationCount() != null) {
            entity.setOperationCount(request.getOperationCount());
        }
        if (StringUtils.hasText(request.getStandardCode())) {
            entity.setStandardCode(request.getStandardCode());
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
