package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpOrderChangeQuery;
import com.huaweicloud.plm.system.dto.ErpOrderChangeSaveRequest;
import com.huaweicloud.plm.system.entity.ErpOrderChange;
import com.huaweicloud.plm.system.mapper.ErpOrderChangeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 销售管理—订单变更（G3-N2 ERP 销售管理）：
 * 订单变更登记、分页查询与删除。
 * 变更单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpOrderChangeService {

    private static final String DEFAULT_CHANGE_NO_PREFIX = "SOC";
    private static final String DEFAULT_CHANGE_TYPE = "QUANTITY";
    private static final String DEFAULT_CHANGE_STATUS = "DRAFT";

    private final ErpOrderChangeMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询订单变更：状态/类型/订单编号精确，变更单号/订单编号/变更原因模糊，按主键倒序。 */
    public PageResult<ErpOrderChange> pageOrderChanges(ErpOrderChangeQuery query) {
        Page<ErpOrderChange> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpOrderChange>lambdaQuery()
                .eq(StringUtils.hasText(query.getChangeStatus()),
                        ErpOrderChange::getChangeStatus, query.getChangeStatus())
                .eq(StringUtils.hasText(query.getChangeType()),
                        ErpOrderChange::getChangeType, query.getChangeType())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpOrderChange::getOrderNo, query.getOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpOrderChange::getChangeNo, query.getKeyword()).or()
                        .like(ErpOrderChange::getOrderNo, query.getKeyword()).or()
                        .like(ErpOrderChange::getChangeReason, query.getKeyword()))
                .orderByDesc(ErpOrderChange::getId));
        return PageResult.of(page);
    }

    public ErpOrderChange detail(Long id) {
        return require(id);
    }

    /** 新增或更新订单变更：新增时回填默认变更类型/状态与组织，变更单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpOrderChangeSaveRequest request) {
        ErpOrderChange entity;
        if (id == null) {
            entity = new ErpOrderChange();
            entity.setChangeNo(StringUtils.hasText(request.getChangeNo())
                    ? request.getChangeNo() : flowSupport.nextBizNo(DEFAULT_CHANGE_NO_PREFIX));
            entity.setChangeType(StringUtils.hasText(request.getChangeType())
                    ? request.getChangeType() : DEFAULT_CHANGE_TYPE);
            entity.setChangeStatus(StringUtils.hasText(request.getChangeStatus())
                    ? request.getChangeStatus() : DEFAULT_CHANGE_STATUS);
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

    /** 删除订单变更：物理删除以释放变更单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpOrderChange require(Long id) {
        ErpOrderChange entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "订单变更不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpOrderChange entity, ErpOrderChangeSaveRequest request) {
        if (StringUtils.hasText(request.getChangeNo())) {
            entity.setChangeNo(request.getChangeNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (request.getOrderLineNo() != null) {
            entity.setOrderLineNo(request.getOrderLineNo());
        }
        if (StringUtils.hasText(request.getChangeType())) {
            entity.setChangeType(request.getChangeType());
        }
        if (StringUtils.hasText(request.getChangeReason())) {
            entity.setChangeReason(request.getChangeReason());
        }
        if (StringUtils.hasText(request.getBeforeValue())) {
            entity.setBeforeValue(request.getBeforeValue());
        }
        if (StringUtils.hasText(request.getAfterValue())) {
            entity.setAfterValue(request.getAfterValue());
        }
        if (StringUtils.hasText(request.getApplicant())) {
            entity.setApplicant(request.getApplicant());
        }
        if (request.getApplyDate() != null) {
            entity.setApplyDate(request.getApplyDate());
        }
        if (StringUtils.hasText(request.getChangeStatus())) {
            entity.setChangeStatus(request.getChangeStatus());
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
