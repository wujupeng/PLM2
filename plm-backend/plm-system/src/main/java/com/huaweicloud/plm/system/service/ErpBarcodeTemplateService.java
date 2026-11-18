package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpBarcodeTemplateQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeTemplateSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcodeTemplate;
import com.huaweicloud.plm.system.mapper.ErpBarcodeTemplateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 条码管理—标签模板（对应 WBS G3-N7a ERP 条码管理）：
 * 标签模板登记、分页查询与删除。
 * 模板编码由用户录入，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpBarcodeTemplateService {

    private static final String DEFAULT_TEMPLATE_TYPE = "MATERIAL";
    private static final BigDecimal DEFAULT_LABEL_WIDTH = new BigDecimal("40");
    private static final BigDecimal DEFAULT_LABEL_HEIGHT = new BigDecimal("30");
    private static final String DEFAULT_TEMPLATE_STATUS = "ACTIVE";

    private final ErpBarcodeTemplateMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询标签模板：类型/状态精确，模板编码/模板名称模糊，按主键倒序。 */
    public PageResult<ErpBarcodeTemplate> page(ErpBarcodeTemplateQuery query) {
        Page<ErpBarcodeTemplate> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpBarcodeTemplate>lambdaQuery()
                .eq(StringUtils.hasText(query.getTemplateType()),
                        ErpBarcodeTemplate::getTemplateType, query.getTemplateType())
                .eq(StringUtils.hasText(query.getTemplateStatus()),
                        ErpBarcodeTemplate::getTemplateStatus, query.getTemplateStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpBarcodeTemplate::getTemplateCode, query.getKeyword()).or()
                        .like(ErpBarcodeTemplate::getTemplateName, query.getKeyword()))
                .orderByDesc(ErpBarcodeTemplate::getId));
        return PageResult.of(page);
    }

    public ErpBarcodeTemplate detail(Long id) {
        return require(id);
    }

    /** 新增或更新标签模板：新增时回填默认模板类型/标签尺寸与状态及组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpBarcodeTemplateSaveRequest request) {
        ErpBarcodeTemplate entity;
        if (id == null) {
            entity = new ErpBarcodeTemplate();
            entity.setTemplateCode(request.getTemplateCode());
            entity.setTemplateType(StringUtils.hasText(request.getTemplateType())
                    ? request.getTemplateType() : DEFAULT_TEMPLATE_TYPE);
            entity.setLabelWidth(request.getLabelWidth() != null
                    ? request.getLabelWidth() : DEFAULT_LABEL_WIDTH);
            entity.setLabelHeight(request.getLabelHeight() != null
                    ? request.getLabelHeight() : DEFAULT_LABEL_HEIGHT);
            entity.setTemplateStatus(StringUtils.hasText(request.getTemplateStatus())
                    ? request.getTemplateStatus() : DEFAULT_TEMPLATE_STATUS);
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

    /** 删除标签模板：物理删除以释放模板编码。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpBarcodeTemplate require(Long id) {
        ErpBarcodeTemplate entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "标签模板不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpBarcodeTemplate entity, ErpBarcodeTemplateSaveRequest request) {
        if (StringUtils.hasText(request.getTemplateCode())) {
            entity.setTemplateCode(request.getTemplateCode());
        }
        if (StringUtils.hasText(request.getTemplateName())) {
            entity.setTemplateName(request.getTemplateName());
        }
        if (StringUtils.hasText(request.getTemplateType())) {
            entity.setTemplateType(request.getTemplateType());
        }
        if (request.getLabelWidth() != null) {
            entity.setLabelWidth(request.getLabelWidth());
        }
        if (request.getLabelHeight() != null) {
            entity.setLabelHeight(request.getLabelHeight());
        }
        if (StringUtils.hasText(request.getContentConfig())) {
            entity.setContentConfig(request.getContentConfig());
        }
        if (StringUtils.hasText(request.getPrintPermission())) {
            entity.setPrintPermission(request.getPrintPermission());
        }
        if (StringUtils.hasText(request.getTemplateStatus())) {
            entity.setTemplateStatus(request.getTemplateStatus());
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
