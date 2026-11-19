package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.MigOpenBusinessReconcileQuery;
import com.huaweicloud.plm.system.dto.MigOpenBusinessReconcileSaveRequest;
import com.huaweicloud.plm.system.entity.MigOpenBusinessReconcile;
import com.huaweicloud.plm.system.mapper.MigOpenBusinessReconcileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 未结业务迁移对账服务：对账记录的登记、分页查询与删除。
 * 对账编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class MigOpenBusinessReconcileService {

    private static final String DEFAULT_NO_PREFIX = "OBO";
    private static final String DEFAULT_OBJECT_TYPE = "OPEN_SALES_ORDER";
    private static final Integer DEFAULT_COUNT = 0;
    private static final String DEFAULT_RECONCILE_STATUS = "PENDING";

    private final MigOpenBusinessReconcileMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询对账：对象类型/对账状态/接口编号精确，对账编号/对账名称/结果信息模糊，按主键倒序。 */
    public PageResult<MigOpenBusinessReconcile> page(MigOpenBusinessReconcileQuery query) {
        String keyword = query.getKeyword();
        Page<MigOpenBusinessReconcile> page = mapper.selectPage(query.toPage(), Wrappers.<MigOpenBusinessReconcile>lambdaQuery()
                .eq(StringUtils.hasText(query.getObjectType()), MigOpenBusinessReconcile::getObjectType, query.getObjectType())
                .eq(StringUtils.hasText(query.getReconcileStatus()), MigOpenBusinessReconcile::getReconcileStatus, query.getReconcileStatus())
                .eq(StringUtils.hasText(query.getInterfaceNo()), MigOpenBusinessReconcile::getInterfaceNo, query.getInterfaceNo())
                .and(StringUtils.hasText(keyword), w -> w
                        .like(MigOpenBusinessReconcile::getReconcileNo, keyword).or()
                        .like(MigOpenBusinessReconcile::getReconcileName, keyword).or()
                        .like(MigOpenBusinessReconcile::getResultMessage, keyword))
                .orderByDesc(MigOpenBusinessReconcile::getId));
        return PageResult.of(page);
    }

    public MigOpenBusinessReconcile detail(Long id) {
        return require(id);
    }

    /** 新增或更新对账：新增时回填默认对象类型/计数字段/对账状态与组织，对账编号为空时自动生成。 */
    public Long save(Long id, MigOpenBusinessReconcileSaveRequest request) {
        MigOpenBusinessReconcile entity;
        if (id == null) {
            entity = new MigOpenBusinessReconcile();
            entity.setReconcileNo(StringUtils.hasText(request.getReconcileNo())
                    ? request.getReconcileNo()
                    : flowSupport.nextBizNo(DEFAULT_NO_PREFIX));
            entity.setObjectType(StringUtils.hasText(request.getObjectType())
                    ? request.getObjectType() : DEFAULT_OBJECT_TYPE);
            entity.setSourceCount(request.getSourceCount() == null
                    ? DEFAULT_COUNT : request.getSourceCount());
            entity.setTargetCount(request.getTargetCount() == null
                    ? DEFAULT_COUNT : request.getTargetCount());
            entity.setDiffCount(request.getDiffCount() == null
                    ? DEFAULT_COUNT : request.getDiffCount());
            entity.setReconcileStatus(StringUtils.hasText(request.getReconcileStatus())
                    ? request.getReconcileStatus() : DEFAULT_RECONCILE_STATUS);
            entity.setOrgId(currentOrgId());
            applyRequest(entity, request);
            mapper.insert(entity);
        } else {
            entity = require(id);
            applyRequest(entity, request);
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除对账：物理删除以释放对账编号。 */
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    private MigOpenBusinessReconcile require(Long id) {
        MigOpenBusinessReconcile entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "对账记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(MigOpenBusinessReconcile entity, MigOpenBusinessReconcileSaveRequest request) {
        if (StringUtils.hasText(request.getReconcileNo())) {
            entity.setReconcileNo(request.getReconcileNo());
        }
        if (StringUtils.hasText(request.getReconcileName())) {
            entity.setReconcileName(request.getReconcileName());
        }
        if (StringUtils.hasText(request.getInterfaceNo())) {
            entity.setInterfaceNo(request.getInterfaceNo());
        }
        if (StringUtils.hasText(request.getObjectType())) {
            entity.setObjectType(request.getObjectType());
        }
        if (request.getSourceCount() != null) {
            entity.setSourceCount(request.getSourceCount());
        }
        if (request.getTargetCount() != null) {
            entity.setTargetCount(request.getTargetCount());
        }
        if (request.getDiffCount() != null) {
            entity.setDiffCount(request.getDiffCount());
        }
        if (request.getReconcileDate() != null) {
            entity.setReconcileDate(request.getReconcileDate());
        }
        if (StringUtils.hasText(request.getReconcileStatus())) {
            entity.setReconcileStatus(request.getReconcileStatus());
        }
        if (StringUtils.hasText(request.getResultMessage())) {
            entity.setResultMessage(request.getResultMessage());
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
