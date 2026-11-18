package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.LabelRenderElement;
import com.huaweicloud.plm.system.dto.LabelRenderRequest;
import com.huaweicloud.plm.system.dto.LabelRenderResponse;
import com.huaweicloud.plm.system.dto.LabelTemplateQuery;
import com.huaweicloud.plm.system.dto.LabelTemplateSaveRequest;
import com.huaweicloud.plm.system.entity.LabelTemplate;
import com.huaweicloud.plm.system.mapper.LabelTemplateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 标签模板配置服务（N5）：模板维护、发布停用、按元素配置渲染标签内容与条码。
 */
@Service
@RequiredArgsConstructor
public class LabelTemplateService {

    private static final String DEFAULT_STATUS = "draft";
    private static final String STATUS_RELEASED = "released";
    private static final String STATUS_DISABLED = "disabled";
    private static final String DEFAULT_TEMPLATE_VERSION = "V1";
    private static final String DEFAULT_UNIT = "mm";
    private static final int DEFAULT_DPI = 300;
    private static final String DEFAULT_BARCODE_TYPE = "DATA_MATRIX";
    private static final String DEFAULT_ECC_LEVEL = "ECC200";
    private static final BigDecimal DEFAULT_MODULE_SIZE = new BigDecimal("0.40");
    private static final BigDecimal DEFAULT_PAPER_WIDTH = new BigDecimal("50.00");
    private static final BigDecimal DEFAULT_PAPER_HEIGHT = new BigDecimal("30.00");
    private static final String DEFAULT_ALIGN = "left";
    private static final String BARCODE_KEY = "barcode";
    private static final int MIN_SIZE_PX = 100;
    private static final int MAX_SIZE_PX = 800;

    private final LabelTemplateMapper labelTemplateMapper;
    private final BarcodeService barcodeService;
    private final ObjectMapper objectMapper;

    public PageResult<LabelTemplate> page(LabelTemplateQuery query) {
        Page<LabelTemplate> page = query.toPage();
        labelTemplateMapper.selectPage(page, Wrappers.<LabelTemplate>lambdaQuery()
                .eq(StringUtils.hasText(query.getTemplateCode()), LabelTemplate::getTemplateCode, query.getTemplateCode())
                .like(StringUtils.hasText(query.getTemplateName()), LabelTemplate::getTemplateName, query.getTemplateName())
                .eq(StringUtils.hasText(query.getLabelType()), LabelTemplate::getLabelType, query.getLabelType())
                .eq(StringUtils.hasText(query.getStatus()), LabelTemplate::getStatus, query.getStatus())
                .orderByDesc(LabelTemplate::getCreatedAt));
        return PageResult.of(page);
    }

    public List<LabelTemplate> listOptions(String labelType) {
        return labelTemplateMapper.selectList(Wrappers.<LabelTemplate>lambdaQuery()
                .eq(LabelTemplate::getStatus, STATUS_RELEASED)
                .eq(StringUtils.hasText(labelType), LabelTemplate::getLabelType, labelType)
                .orderByAsc(LabelTemplate::getTemplateCode));
    }

    public LabelTemplate detail(Long templateId) {
        return requireTemplate(templateId);
    }

    @Transactional
    public Long create(LabelTemplateSaveRequest request) {
        String version = resolveVersion(request.getTemplateVersion());
        ensureUniqueCode(request.getTemplateCode(), version, -1L);
        LabelTemplate template = new LabelTemplate();
        applyRequest(template, request);
        labelTemplateMapper.insert(template);
        return template.getId();
    }

    @Transactional
    public void update(Long templateId, LabelTemplateSaveRequest request) {
        LabelTemplate template = requireTemplate(templateId);
        String version = resolveVersion(request.getTemplateVersion());
        ensureUniqueCode(request.getTemplateCode(), version, templateId);
        applyRequest(template, request);
        labelTemplateMapper.updateById(template);
    }

    @Transactional
    public void delete(Long templateId) {
        LabelTemplate template = requireTemplate(templateId);
        if (STATUS_RELEASED.equals(template.getStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "已发布的标签模板不允许删除，请先停用");
        }
        labelTemplateMapper.deleteById(templateId);
    }

    @Transactional
    public void release(Long templateId) {
        LabelTemplate template = requireTemplate(templateId);
        template.setStatus(STATUS_RELEASED);
        labelTemplateMapper.updateById(template);
    }

    @Transactional
    public void disable(Long templateId) {
        LabelTemplate template = requireTemplate(templateId);
        template.setStatus(STATUS_DISABLED);
        labelTemplateMapper.updateById(template);
    }

    /**
     * 按模板元素配置渲染标签：解析元素 JSON、填充字段值、生成条码 Base64。
     */
    public LabelRenderResponse render(LabelRenderRequest request) {
        String labelType = request == null ? null : request.getLabelType();
        String templateCode = request == null ? null : request.getTemplateCode();
        LabelTemplate template = matchTemplate(labelType, templateCode);
        List<Map<String, Object>> elements = parseElements(template.getElementJson());
        Map<String, String> fieldValues = request != null && request.getFieldValues() != null
                ? request.getFieldValues() : Collections.emptyMap();

        String barcodeType = StringUtils.hasText(template.getBarcodeType())
                ? template.getBarcodeType() : DEFAULT_BARCODE_TYPE;
        String barcodeContent = resolveBarcodeContent(request, fieldValues);
        int sizePx = resolveSizePx(template, request);

        LabelRenderResponse response = new LabelRenderResponse();
        response.setTemplateCode(template.getTemplateCode());
        response.setTemplateName(template.getTemplateName());
        response.setLabelType(template.getLabelType());
        response.setPaperWidth(template.getPaperWidth());
        response.setPaperHeight(template.getPaperHeight());
        response.setUnit(template.getUnit());
        response.setDpi(template.getDpi());
        response.setBarcodeType(barcodeType);
        response.setModuleSize(template.getModuleSize());
        response.setBarcodeContent(barcodeContent);
        response.setItems(new ArrayList<>());
        response.setWarnings(new ArrayList<>());

        if (StringUtils.hasText(barcodeContent)) {
            response.setBarcodeBase64(barcodeService.toBase64Png(barcodeContent, sizePx, barcodeType));
        }

        for (Map<String, Object> element : elements) {
            String key = asString(element.get("key"));
            LabelRenderElement item = new LabelRenderElement();
            item.setKey(key);
            item.setLabel(asString(element.get("label")));
            item.setX(asBigDecimal(element.get("x")));
            item.setY(asBigDecimal(element.get("y")));
            item.setW(asBigDecimal(element.get("w")));
            item.setH(asBigDecimal(element.get("h")));
            item.setFontSize(asInteger(element.get("fontSize")));
            String align = asString(element.get("align"));
            item.setAlign(StringUtils.hasText(align) ? align : DEFAULT_ALIGN);
            item.setValue(BARCODE_KEY.equals(key) ? barcodeContent : fieldValues.get(key));
            response.getItems().add(item);
        }

        if (template.getDpi() == null || template.getModuleSize() == null) {
            response.getWarnings().add("标签模板未配置 DPI 或模块尺寸，条码像素尺寸按默认值推算，待业务方按打印精度确认");
        }
        return response;
    }

    /**
     * 匹配标签模板：指定编码时优先已发布版本，其次取最大版本；未指定编码时取该标签类型下已发布的第一条。
     */
    public LabelTemplate matchTemplate(String labelType, String templateCode) {
        if (StringUtils.hasText(templateCode)) {
            List<LabelTemplate> candidates = labelTemplateMapper.selectList(Wrappers.<LabelTemplate>lambdaQuery()
                    .eq(LabelTemplate::getTemplateCode, templateCode)
                    .orderByDesc(LabelTemplate::getTemplateVersion));
            if (CollectionUtils.isEmpty(candidates)) {
                throw new BusinessException(ResultCode.NOT_FOUND, "标签模板不存在: " + templateCode);
            }
            return candidates.stream()
                    .filter(candidate -> STATUS_RELEASED.equals(candidate.getStatus()))
                    .findFirst()
                    .orElse(candidates.get(0));
        }
        LabelTemplate template = labelTemplateMapper.selectOne(Wrappers.<LabelTemplate>lambdaQuery()
                .eq(LabelTemplate::getStatus, STATUS_RELEASED)
                .eq(StringUtils.hasText(labelType), LabelTemplate::getLabelType, labelType)
                .orderByDesc(LabelTemplate::getTemplateVersion)
                .last("LIMIT 1"));
        if (template == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "未找到可用的标签模板: " + labelType);
        }
        return template;
    }

    private List<Map<String, Object>> parseElements(String elementJson) {
        if (!StringUtils.hasText(elementJson)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(elementJson, new TypeReference<List<Map<String, Object>>>() {
            });
        } catch (JsonProcessingException e) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "标签模板元素配置不是合法 JSON");
        }
    }

    private String resolveBarcodeContent(LabelRenderRequest request, Map<String, String> fieldValues) {
        String content = request == null ? null : request.getBarcodeContent();
        if (StringUtils.hasText(content)) {
            return content;
        }
        String targetCode = fieldValues.get("targetCode");
        if (StringUtils.hasText(targetCode)) {
            return targetCode;
        }
        return fieldValues.get(BARCODE_KEY);
    }

    private int resolveSizePx(LabelTemplate template, LabelRenderRequest request) {
        if (request != null && request.getSizePx() != null) {
            return clampSizePx(request.getSizePx());
        }
        double dpi = template.getDpi() == null ? DEFAULT_DPI : template.getDpi();
        double moduleSize = template.getModuleSize() == null
                ? DEFAULT_MODULE_SIZE.doubleValue() : template.getModuleSize().doubleValue();
        return clampSizePx((int) Math.round(moduleSize * 24 * dpi / 25.4));
    }

    private int clampSizePx(int sizePx) {
        if (sizePx < MIN_SIZE_PX) {
            return MIN_SIZE_PX;
        }
        return Math.min(sizePx, MAX_SIZE_PX);
    }

    private void ensureUniqueCode(String templateCode, String templateVersion, Long excludeId) {
        if (labelTemplateMapper.countByCode(templateCode, templateVersion, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "标签模板编码已存在: " + templateCode);
        }
    }

    private void applyRequest(LabelTemplate template, LabelTemplateSaveRequest request) {
        template.setTemplateCode(request.getTemplateCode());
        template.setTemplateName(request.getTemplateName());
        template.setTemplateVersion(resolveVersion(request.getTemplateVersion()));
        template.setLabelType(request.getLabelType());
        template.setPaperWidth(request.getPaperWidth() == null ? DEFAULT_PAPER_WIDTH : request.getPaperWidth());
        template.setPaperHeight(request.getPaperHeight() == null ? DEFAULT_PAPER_HEIGHT : request.getPaperHeight());
        template.setUnit(StringUtils.hasText(request.getUnit()) ? request.getUnit() : DEFAULT_UNIT);
        template.setDpi(request.getDpi() == null ? DEFAULT_DPI : request.getDpi());
        template.setBarcodeType(StringUtils.hasText(request.getBarcodeType())
                ? request.getBarcodeType() : DEFAULT_BARCODE_TYPE);
        template.setDmSymbolSize(request.getDmSymbolSize());
        template.setDmEccLevel(StringUtils.hasText(request.getDmEccLevel())
                ? request.getDmEccLevel() : DEFAULT_ECC_LEVEL);
        template.setModuleSize(request.getModuleSize() == null ? DEFAULT_MODULE_SIZE : request.getModuleSize());
        template.setElementJson(request.getElementJson());
        template.setLayoutJson(request.getLayoutJson());
        template.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus()
                : (template.getStatus() == null ? DEFAULT_STATUS : template.getStatus()));
        template.setRemark(request.getRemark());
    }

    private String resolveVersion(String templateVersion) {
        return StringUtils.hasText(templateVersion) ? templateVersion : DEFAULT_TEMPLATE_VERSION;
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private BigDecimal asBigDecimal(Object value) {
        return value == null ? BigDecimal.ZERO : new BigDecimal(String.valueOf(value));
    }

    private Integer asInteger(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.valueOf(String.valueOf(value));
    }

    private LabelTemplate requireTemplate(Long templateId) {
        LabelTemplate template = labelTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "标签模板不存在: " + templateId);
        }
        return template;
    }
}
