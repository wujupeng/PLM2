package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsStrategyQuery;
import com.huaweicloud.plm.system.dto.WmsStrategySaveRequest;
import com.huaweicloud.plm.system.entity.WmsStrategy;
import com.huaweicloud.plm.system.mapper.WmsStrategyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * WMS 仓储基础数据—作业策略（对应作业策略）：
 * 作业策略登记、分页查询与删除。
 * 策略编码支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsStrategyService {

    private static final String DEFAULT_STRATEGY_NO_PREFIX = "STG";
    private static final String DEFAULT_STRATEGY_TYPE = "PUTAWAY";
    private static final String DEFAULT_STRATEGY_STATUS = "DRAFT";
    private static final Integer DEFAULT_PRIORITY = 0;
    private static final Integer DEFAULT_FIFO_FLAG = 0;

    private final WmsStrategyMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询作业策略记录：策略类型/策略状态精确，策略编码/策略名称模糊，按主键倒序。 */
    public PageResult<WmsStrategy> page(WmsStrategyQuery query) {
        Page<WmsStrategy> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsStrategy>lambdaQuery()
                .eq(StringUtils.hasText(query.getStrategyType()),
                        WmsStrategy::getStrategyType, query.getStrategyType())
                .eq(StringUtils.hasText(query.getStrategyStatus()),
                        WmsStrategy::getStrategyStatus, query.getStrategyStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsStrategy::getStrategyCode, query.getKeyword()).or()
                        .like(WmsStrategy::getStrategyName, query.getKeyword()))
                .orderByDesc(WmsStrategy::getId));
        return PageResult.of(page);
    }

    public WmsStrategy detail(Long id) {
        return require(id);
    }

    /** 新增或更新作业策略记录：新增时回填默认类型/状态/优先级/先进先出与组织，策略编码为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsStrategySaveRequest request) {
        WmsStrategy entity;
        if (id == null) {
            entity = new WmsStrategy();
            entity.setStrategyCode(StringUtils.hasText(request.getStrategyCode())
                    ? request.getStrategyCode() : flowSupport.nextBizNo(DEFAULT_STRATEGY_NO_PREFIX));
            entity.setStrategyType(StringUtils.hasText(request.getStrategyType())
                    ? request.getStrategyType() : DEFAULT_STRATEGY_TYPE);
            entity.setStrategyStatus(StringUtils.hasText(request.getStrategyStatus())
                    ? request.getStrategyStatus() : DEFAULT_STRATEGY_STATUS);
            entity.setPriority(request.getPriority() != null ? request.getPriority() : DEFAULT_PRIORITY);
            entity.setFifoFlag(request.getFifoFlag() != null ? request.getFifoFlag() : DEFAULT_FIFO_FLAG);
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

    /** 删除作业策略记录：物理删除以释放策略编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsStrategy require(Long id) {
        WmsStrategy entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "作业策略不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsStrategy entity, WmsStrategySaveRequest request) {
        if (StringUtils.hasText(request.getStrategyCode())) {
            entity.setStrategyCode(request.getStrategyCode());
        }
        if (StringUtils.hasText(request.getStrategyName())) {
            entity.setStrategyName(request.getStrategyName());
        }
        if (StringUtils.hasText(request.getStrategyType())) {
            entity.setStrategyType(request.getStrategyType());
        }
        if (request.getPriority() != null) {
            entity.setPriority(request.getPriority());
        }
        if (request.getFifoFlag() != null) {
            entity.setFifoFlag(request.getFifoFlag());
        }
        if (StringUtils.hasText(request.getRuleContent())) {
            entity.setRuleContent(request.getRuleContent());
        }
        if (StringUtils.hasText(request.getStrategyStatus())) {
            entity.setStrategyStatus(request.getStrategyStatus());
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
