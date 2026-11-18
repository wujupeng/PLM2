package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpUomConversionQuery;
import com.huaweicloud.plm.system.dto.ErpUomConversionSaveRequest;
import com.huaweicloud.plm.system.entity.ErpUomConversion;
import com.huaweicloud.plm.system.mapper.ErpUomConversionMapper;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * ERP 基础资料—计量单位换算（G3-N1 ERP 基础资料 WBS T021）：
 * 计量单位换算登记、分页查询与删除。
 * 换算编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpUomConversionService {

    private static final BigDecimal DEFAULT_CONVERSION_RATE = BigDecimal.ONE;
    private static final String DEFAULT_CONVERSION_STATUS = "ACTIVE";

    private final ErpUomConversionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询计量单位换算：状态精确，编号/源单位/目标单位/物料编码模糊，按主键倒序。 */
    public PageResult<ErpUomConversion> pageUomConversions(ErpUomConversionQuery query) {
        Page<ErpUomConversion> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpUomConversion>lambdaQuery()
                .eq(StringUtils.hasText(query.getConversionStatus()),
                        ErpUomConversion::getConversionStatus, query.getConversionStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpUomConversion::getConversionNo, query.getKeyword()).or()
                        .like(ErpUomConversion::getFromUom, query.getKeyword()).or()
                        .like(ErpUomConversion::getToUom, query.getKeyword()).or()
                        .like(ErpUomConversion::getMaterialCode, query.getKeyword()))
                .orderByDesc(ErpUomConversion::getId));
        return PageResult.of(page);
    }

    public ErpUomConversion detail(Long id) {
        return require(id);
    }

    /** 新增或更新计量单位换算：新增时回填默认换算率/状态与组织，编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpUomConversionSaveRequest request) {
        ErpUomConversion entity;
        if (id == null) {
            entity = new ErpUomConversion();
            entity.setConversionNo(StringUtils.hasText(request.getConversionNo())
                    ? request.getConversionNo() : flowSupport.nextBizNo("EUCV"));
            entity.setConversionRate(request.getConversionRate() != null
                    ? request.getConversionRate() : DEFAULT_CONVERSION_RATE);
            entity.setConversionStatus(StringUtils.hasText(request.getConversionStatus())
                    ? request.getConversionStatus() : DEFAULT_CONVERSION_STATUS);
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

    /** 删除计量单位换算：物理删除以释放换算编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpUomConversion require(Long id) {
        ErpUomConversion entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "计量单位换算不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空 / 数值非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpUomConversion entity, ErpUomConversionSaveRequest request) {
        if (StringUtils.hasText(request.getConversionNo())) {
            entity.setConversionNo(request.getConversionNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getFromUom())) {
            entity.setFromUom(request.getFromUom());
        }
        if (StringUtils.hasText(request.getToUom())) {
            entity.setToUom(request.getToUom());
        }
        if (request.getConversionRate() != null) {
            entity.setConversionRate(request.getConversionRate());
        }
        if (StringUtils.hasText(request.getConversionStatus())) {
            entity.setConversionStatus(request.getConversionStatus());
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
