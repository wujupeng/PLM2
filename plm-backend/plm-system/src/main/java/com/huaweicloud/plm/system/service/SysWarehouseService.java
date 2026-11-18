package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysWarehouseSaveRequest;
import com.huaweicloud.plm.system.entity.SysWarehouse;
import com.huaweicloud.plm.system.mapper.SysWarehouseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 仓库（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 仓库登记、启停状态流转与统计。
 * 仓库编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysWarehouseService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysWarehouseMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询仓库：所属工厂/仓库类型/仓库状态精确，关键字匹配编码/名称，时间区间作用于创建时间。 */
    public PageResult<SysWarehouse> pageWarehouses(OrgQuery query) {
        Page<SysWarehouse> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysWarehouse>lambdaQuery()
                .eq(StringUtils.hasText(query.getFactoryCode()),
                        SysWarehouse::getFactoryCode, query.getFactoryCode())
                .eq(StringUtils.hasText(query.getWarehouseType()),
                        SysWarehouse::getWarehouseType, query.getWarehouseType())
                .eq(StringUtils.hasText(query.getWarehouseStatus()),
                        SysWarehouse::getWarehouseStatus, query.getWarehouseStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysWarehouse::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysWarehouse::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysWarehouse::getWarehouseCode, query.getKeyword()).or()
                        .like(SysWarehouse::getWarehouseName, query.getKeyword()))
                .orderByDesc(SysWarehouse::getId));
        return PageResult.of(page);
    }

    public SysWarehouse detail(Long id) {
        return require(id);
    }

    /** 新增或更新仓库：新增时回填默认仓库状态与组织，容量为空置 0，仓库编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysWarehouseSaveRequest request) {
        SysWarehouse entity;
        if (id == null) {
            entity = new SysWarehouse();
            entity.setWarehouseCode(StringUtils.hasText(request.getWarehouseCode())
                    ? request.getWarehouseCode() : flowSupport.nextBizNo("WH"));
            entity.setWarehouseStatus(STATUS_ACTIVE);
            entity.setCapacity(request.getCapacity() == null ? 0L : request.getCapacity());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getWarehouseCode())) {
                entity.setWarehouseCode(request.getWarehouseCode());
            }
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 启用：仓库状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysWarehouse enable(Long id) {
        return changeWarehouseStatus(id, STATUS_ACTIVE);
    }

    /** 停用：仓库状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysWarehouse disable(Long id) {
        return changeWarehouseStatus(id, STATUS_DISABLED);
    }

    /** 删除仓库：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 仓库统计：按仓库状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysWarehouse::getWarehouseStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysWarehouse::getWarehouseStatus, STATUS_DISABLED));
        return result;
    }

    public SysWarehouse require(Long id) {
        SysWarehouse entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "仓库不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(SysWarehouse entity, SysWarehouseSaveRequest request) {
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getWarehouseName())) {
            entity.setWarehouseName(request.getWarehouseName());
        }
        if (StringUtils.hasText(request.getFactoryCode())) {
            entity.setFactoryCode(request.getFactoryCode());
        }
        if (StringUtils.hasText(request.getWarehouseType())) {
            entity.setWarehouseType(request.getWarehouseType());
        }
        if (StringUtils.hasText(request.getLocation())) {
            entity.setLocation(request.getLocation());
        }
        if (request.getCapacity() != null) {
            entity.setCapacity(request.getCapacity());
        }
        if (StringUtils.hasText(request.getManager())) {
            entity.setManager(request.getManager());
        }
        if (StringUtils.hasText(request.getWarehouseStatus())) {
            entity.setWarehouseStatus(request.getWarehouseStatus());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private SysWarehouse changeWarehouseStatus(Long id, String warehouseStatus) {
        SysWarehouse entity = require(id);
        entity.setWarehouseStatus(warehouseStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysWarehouse, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysWarehouse>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
