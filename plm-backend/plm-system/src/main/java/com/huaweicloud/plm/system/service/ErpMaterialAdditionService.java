package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpMaterialAdditionQuery;
import com.huaweicloud.plm.system.dto.ErpMaterialAdditionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpMaterialAddition;
import com.huaweicloud.plm.system.mapper.ErpMaterialAdditionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 生产管理—生产补料单（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 生产补料登记、分页查询与删除。
 * 补料单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpMaterialAdditionService {

    private static final String DEFAULT_ADDITION_NO_PREFIX = "EMA";
    private static final String DEFAULT_ADDITION_TYPE = "NORMAL";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_APPROVAL_STATUS = "PENDING";
    private static final String DEFAULT_ADDITION_STATUS = "DRAFT";

    private final ErpMaterialAdditionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询生产补料单：状态/类型/订单号精确，补料单号/物料名称模糊，按主键倒序。 */
    public PageResult<ErpMaterialAddition> page(ErpMaterialAdditionQuery query) {
        Page<ErpMaterialAddition> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpMaterialAddition>lambdaQuery()
                .eq(StringUtils.hasText(query.getAdditionStatus()),
                        ErpMaterialAddition::getAdditionStatus, query.getAdditionStatus())
                .eq(StringUtils.hasText(query.getAdditionType()),
                        ErpMaterialAddition::getAdditionType, query.getAdditionType())
                .eq(StringUtils.hasText(query.getOrderNo()),
                        ErpMaterialAddition::getOrderNo, query.getOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpMaterialAddition::getAdditionNo, query.getKeyword()).or()
                        .like(ErpMaterialAddition::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpMaterialAddition::getId));
        return PageResult.of(page);
    }

    public ErpMaterialAddition detail(Long id) {
        return require(id);
    }

    /** 新增或更新生产补料单：新增时回填默认类型/单位/状态/数量与组织，补料单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpMaterialAdditionSaveRequest request) {
        ErpMaterialAddition entity;
        if (id == null) {
            entity = new ErpMaterialAddition();
            entity.setAdditionNo(StringUtils.hasText(request.getAdditionNo())
                    ? request.getAdditionNo() : flowSupport.nextBizNo(DEFAULT_ADDITION_NO_PREFIX));
            entity.setAdditionType(StringUtils.hasText(request.getAdditionType())
                    ? request.getAdditionType() : DEFAULT_ADDITION_TYPE);
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setApprovalStatus(StringUtils.hasText(request.getApprovalStatus())
                    ? request.getApprovalStatus() : DEFAULT_APPROVAL_STATUS);
            entity.setAdditionStatus(StringUtils.hasText(request.getAdditionStatus())
                    ? request.getAdditionStatus() : DEFAULT_ADDITION_STATUS);
            entity.setAdditionQty(request.getAdditionQty() != null
                    ? request.getAdditionQty() : BigDecimal.ZERO);
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

    /** 删除生产补料单：物理删除以释放补料单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpMaterialAddition require(Long id) {
        ErpMaterialAddition entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产补料单不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpMaterialAddition entity, ErpMaterialAdditionSaveRequest request) {
        if (StringUtils.hasText(request.getAdditionNo())) {
            entity.setAdditionNo(request.getAdditionNo());
        }
        if (StringUtils.hasText(request.getOrderNo())) {
            entity.setOrderNo(request.getOrderNo());
        }
        if (StringUtils.hasText(request.getAdditionType())) {
            entity.setAdditionType(request.getAdditionType());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (request.getAdditionQty() != null) {
            entity.setAdditionQty(request.getAdditionQty());
        }
        if (StringUtils.hasText(request.getAdditionReason())) {
            entity.setAdditionReason(request.getAdditionReason());
        }
        if (StringUtils.hasText(request.getOverIssueReason())) {
            entity.setOverIssueReason(request.getOverIssueReason());
        }
        if (StringUtils.hasText(request.getApprovalStatus())) {
            entity.setApprovalStatus(request.getApprovalStatus());
        }
        if (StringUtils.hasText(request.getAdditionBy())) {
            entity.setAdditionBy(request.getAdditionBy());
        }
        if (request.getAdditionDate() != null) {
            entity.setAdditionDate(request.getAdditionDate());
        }
        if (StringUtils.hasText(request.getAdditionStatus())) {
            entity.setAdditionStatus(request.getAdditionStatus());
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
