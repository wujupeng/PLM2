package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpUomQuery;
import com.huaweicloud.plm.system.dto.ErpUomSaveRequest;
import com.huaweicloud.plm.system.entity.ErpUom;
import com.huaweicloud.plm.system.mapper.ErpUomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 基础资料—计量单位业务档案（G3-N1 ERP 基础资料 WBS T021）：
 * 计量单位档案登记、分页查询与删除。
 * 计量单位编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpUomService {

    private static final String DEFAULT_UOM_NO_PREFIX = "EUOM";
    private static final String DEFAULT_UOM_TYPE = "BASE";
    private static final String DEFAULT_UOM_STATUS = "ACTIVE";

    private final ErpUomMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询计量单位档案：类型/状态精确，编号/编码/名称模糊，按主键倒序。 */
    public PageResult<ErpUom> pageUoms(ErpUomQuery query) {
        Page<ErpUom> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpUom>lambdaQuery()
                .eq(StringUtils.hasText(query.getUomType()),
                        ErpUom::getUomType, query.getUomType())
                .eq(StringUtils.hasText(query.getUomStatus()),
                        ErpUom::getUomStatus, query.getUomStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpUom::getUomNo, query.getKeyword()).or()
                        .like(ErpUom::getUomCode, query.getKeyword()).or()
                        .like(ErpUom::getUomName, query.getKeyword()))
                .orderByDesc(ErpUom::getId));
        return PageResult.of(page);
    }

    public ErpUom detail(Long id) {
        return require(id);
    }

    /** 新增或更新计量单位档案：新增时回填默认类型/精度/状态与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpUomSaveRequest request) {
        ErpUom entity;
        if (id == null) {
            entity = new ErpUom();
            entity.setUomNo(StringUtils.hasText(request.getUomNo())
                    ? request.getUomNo() : flowSupport.nextBizNo(DEFAULT_UOM_NO_PREFIX));
            entity.setUomType(StringUtils.hasText(request.getUomType())
                    ? request.getUomType() : DEFAULT_UOM_TYPE);
            entity.setPrecisionDigits(request.getPrecisionDigits() != null
                    ? request.getPrecisionDigits() : 0);
            entity.setUomStatus(StringUtils.hasText(request.getUomStatus())
                    ? request.getUomStatus() : DEFAULT_UOM_STATUS);
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

    /** 删除计量单位档案：物理删除以释放计量单位编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpUom require(Long id) {
        ErpUom entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "计量单位业务档案不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpUom entity, ErpUomSaveRequest request) {
        if (StringUtils.hasText(request.getUomNo())) {
            entity.setUomNo(request.getUomNo());
        }
        if (StringUtils.hasText(request.getUomCode())) {
            entity.setUomCode(request.getUomCode());
        }
        if (StringUtils.hasText(request.getUomName())) {
            entity.setUomName(request.getUomName());
        }
        if (StringUtils.hasText(request.getUomType())) {
            entity.setUomType(request.getUomType());
        }
        if (request.getPrecisionDigits() != null) {
            entity.setPrecisionDigits(request.getPrecisionDigits());
        }
        if (StringUtils.hasText(request.getUomStatus())) {
            entity.setUomStatus(request.getUomStatus());
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
