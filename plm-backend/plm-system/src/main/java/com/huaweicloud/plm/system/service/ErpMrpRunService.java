package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpMrpRunQuery;
import com.huaweicloud.plm.system.dto.ErpMrpRunSaveRequest;
import com.huaweicloud.plm.system.entity.ErpMrpRun;
import com.huaweicloud.plm.system.mapper.ErpMrpRunMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 需求计划—MRP/LRP 运算批次（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 运算批次登记、分页查询与删除。
 * 运算单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpMrpRunService {

    private static final String DEFAULT_RUN_NO_PREFIX = "EMR";
    private static final String DEFAULT_RUN_TYPE = "MRP";
    private static final String DEFAULT_RUN_SCOPE = "ALL";
    private static final String DEFAULT_RUN_STATUS = "DRAFT";

    private final ErpMrpRunMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询运算批次：类型/范围/状态/需求计划号精确，运算单号/运算人模糊，按主键倒序。 */
    public PageResult<ErpMrpRun> page(ErpMrpRunQuery query) {
        Page<ErpMrpRun> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpMrpRun>lambdaQuery()
                .eq(StringUtils.hasText(query.getRunType()),
                        ErpMrpRun::getRunType, query.getRunType())
                .eq(StringUtils.hasText(query.getRunScope()),
                        ErpMrpRun::getRunScope, query.getRunScope())
                .eq(StringUtils.hasText(query.getRunStatus()),
                        ErpMrpRun::getRunStatus, query.getRunStatus())
                .eq(StringUtils.hasText(query.getPlanNo()),
                        ErpMrpRun::getPlanNo, query.getPlanNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpMrpRun::getRunNo, query.getKeyword()).or()
                        .like(ErpMrpRun::getRunBy, query.getKeyword()))
                .orderByDesc(ErpMrpRun::getId));
        return PageResult.of(page);
    }

    public ErpMrpRun detail(Long id) {
        return require(id);
    }

    /** 新增或更新运算批次：新增时回填默认类型/范围/状态/条数与组织，运算单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpMrpRunSaveRequest request) {
        ErpMrpRun entity;
        if (id == null) {
            entity = new ErpMrpRun();
            entity.setRunNo(StringUtils.hasText(request.getRunNo())
                    ? request.getRunNo() : flowSupport.nextBizNo(DEFAULT_RUN_NO_PREFIX));
            entity.setRunType(StringUtils.hasText(request.getRunType())
                    ? request.getRunType() : DEFAULT_RUN_TYPE);
            entity.setRunScope(StringUtils.hasText(request.getRunScope())
                    ? request.getRunScope() : DEFAULT_RUN_SCOPE);
            entity.setRunStatus(StringUtils.hasText(request.getRunStatus())
                    ? request.getRunStatus() : DEFAULT_RUN_STATUS);
            entity.setDemandCount(request.getDemandCount() != null
                    ? request.getDemandCount() : 0);
            entity.setSuggestionCount(request.getSuggestionCount() != null
                    ? request.getSuggestionCount() : 0);
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

    /** 删除运算批次：物理删除以释放运算单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpMrpRun require(Long id) {
        ErpMrpRun entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "MRP/LRP 运算批次不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpMrpRun entity, ErpMrpRunSaveRequest request) {
        if (StringUtils.hasText(request.getRunNo())) {
            entity.setRunNo(request.getRunNo());
        }
        if (StringUtils.hasText(request.getRunType())) {
            entity.setRunType(request.getRunType());
        }
        if (StringUtils.hasText(request.getPlanNo())) {
            entity.setPlanNo(request.getPlanNo());
        }
        if (StringUtils.hasText(request.getRunScope())) {
            entity.setRunScope(request.getRunScope());
        }
        if (request.getRunDate() != null) {
            entity.setRunDate(request.getRunDate());
        }
        if (StringUtils.hasText(request.getRunBy())) {
            entity.setRunBy(request.getRunBy());
        }
        if (request.getDemandCount() != null) {
            entity.setDemandCount(request.getDemandCount());
        }
        if (request.getSuggestionCount() != null) {
            entity.setSuggestionCount(request.getSuggestionCount());
        }
        if (StringUtils.hasText(request.getRunStatus())) {
            entity.setRunStatus(request.getRunStatus());
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
