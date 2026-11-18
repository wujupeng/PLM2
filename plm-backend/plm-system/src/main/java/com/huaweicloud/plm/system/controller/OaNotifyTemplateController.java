package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.NotifyTemplateQuery;
import com.huaweicloud.plm.system.dto.NotifyTemplateSaveRequest;
import com.huaweicloud.plm.system.entity.OaNotifyTemplate;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.NotifyTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/oa/notify-templates")
@RequiredArgsConstructor
public class OaNotifyTemplateController {

    private final NotifyTemplateService notifyTemplateService;

    @GetMapping
    @RequirePermission("oa:notify-template:list")
    public ApiResponse<PageResult<OaNotifyTemplate>> page(NotifyTemplateQuery query) {
        return ApiResponse.success(notifyTemplateService.page(query));
    }

    /** 供通知发送端选择可用模板。 */
    @GetMapping("/enabled")
    @RequirePermission("oa:notify-template:list")
    public ApiResponse<List<OaNotifyTemplate>> listEnabled() {
        return ApiResponse.success(notifyTemplateService.listEnabled());
    }

    @GetMapping("/{templateId}")
    @RequirePermission("oa:notify-template:list")
    public ApiResponse<OaNotifyTemplate> detail(@PathVariable Long templateId) {
        return ApiResponse.success(notifyTemplateService.getDetail(templateId));
    }

    @PostMapping
    @RequirePermission("oa:notify-template:save")
    public ApiResponse<Long> create(@Valid @RequestBody NotifyTemplateSaveRequest request) {
        return ApiResponse.success(notifyTemplateService.create(request));
    }

    @PutMapping("/{templateId}")
    @RequirePermission("oa:notify-template:save")
    public ApiResponse<Void> update(@PathVariable Long templateId,
                                    @Valid @RequestBody NotifyTemplateSaveRequest request) {
        notifyTemplateService.update(templateId, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{templateId}")
    @RequirePermission("oa:notify-template:delete")
    public ApiResponse<Void> delete(@PathVariable Long templateId) {
        notifyTemplateService.delete(templateId);
        return ApiResponse.success();
    }
}
