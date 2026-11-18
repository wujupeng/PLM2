package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.OrgQuery;
import com.huaweicloud.plm.system.dto.SysProductionLineSaveRequest;
import com.huaweicloud.plm.system.entity.SysProductionLine;
import com.huaweicloud.plm.system.mapper.SysProductionLineMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 产线（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 产线登记、启停状态流转与统计。
 * 产线编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysProductionLineService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISABLED = "DISABLED";

    private final SysProductionLineMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询产线：所属工厂/产线类型/产线状态精确，关键字匹配编码/名称，时间区间作用于创建时间。 */
    public PageResult<SysProductionLine> pageProductionLines(OrgQuery query) {
        Page<SysProductionLine> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysProductionLine>lambdaQuery()
                .eq(StringUtils.hasText(query.getFactoryCode()),
                        SysProductionLine::getFactoryCode, query.getFactoryCode())
                .eq(StringUtils.hasText(query.getLineType()),
                        SysProductionLine::getLineType, query.getLineType())
                .eq(StringUtils.hasText(query.getLineStatus()),
                        SysProductionLine::getLineStatus, query.getLineStatus())
                .ge(StringUtils.hasText(query.getStartDate()), SysProductionLine::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysProductionLine::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysProductionLine::getLineCode, query.getKeyword()).or()
                        .like(SysProductionLine::getLineName, query.getKeyword()))
                .orderByDesc(SysProductionLine::getId));
        return PageResult.of(page);
    }

    public SysProductionLine detail(Long id) {
        return require(id);
    }

    /** 新增或更新产线：新增时回填默认产线状态与组织，小时产能为空置 0，产线编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysProductionLineSaveRequest request) {
        SysProductionLine entity;
        if (id == null) {
            entity = new SysProductionLine();
            entity.setLineCode(StringUtils.hasText(request.getLineCode())
                    ? request.getLineCode() : flowSupport.nextBizNo("LINE"));
            entity.setLineStatus(STATUS_ACTIVE);
            entity.setCapacityPerHour(request.getCapacityPerHour() == null ? 0 : request.getCapacityPerHour());
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getLineCode())) {
                entity.setLineCode(request.getLineCode());
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

    /** 启用：产线状态置为 ACTIVE。 */
    @Transactional(rollbackFor = Exception.class)
    public SysProductionLine enable(Long id) {
        return changeLineStatus(id, STATUS_ACTIVE);
    }

    /** 停用：产线状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysProductionLine disable(Long id) {
        return changeLineStatus(id, STATUS_DISABLED);
    }

    /** 删除产线：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 产线统计：按产线状态汇总。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("active", countBy(SysProductionLine::getLineStatus, STATUS_ACTIVE));
        result.put("disabled", countBy(SysProductionLine::getLineStatus, STATUS_DISABLED));
        return result;
    }

    public SysProductionLine require(Long id) {
        SysProductionLine entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "产线不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(SysProductionLine entity, SysProductionLineSaveRequest request) {
        if (StringUtils.hasText(request.getLineCode())) {
            entity.setLineCode(request.getLineCode());
        }
        if (StringUtils.hasText(request.getLineName())) {
            entity.setLineName(request.getLineName());
        }
        if (StringUtils.hasText(request.getFactoryCode())) {
            entity.setFactoryCode(request.getFactoryCode());
        }
        if (StringUtils.hasText(request.getWorkshop())) {
            entity.setWorkshop(request.getWorkshop());
        }
        if (StringUtils.hasText(request.getLineType())) {
            entity.setLineType(request.getLineType());
        }
        if (request.getCapacityPerHour() != null) {
            entity.setCapacityPerHour(request.getCapacityPerHour());
        }
        if (StringUtils.hasText(request.getManager())) {
            entity.setManager(request.getManager());
        }
        if (StringUtils.hasText(request.getLineStatus())) {
            entity.setLineStatus(request.getLineStatus());
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

    private SysProductionLine changeLineStatus(Long id, String lineStatus) {
        SysProductionLine entity = require(id);
        entity.setLineStatus(lineStatus);
        mapper.updateById(entity);
        return entity;
    }

    private Long countBy(SFunction<SysProductionLine, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysProductionLine>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
