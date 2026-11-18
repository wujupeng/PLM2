package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizFactoryParamSaveRequest;
import com.huaweicloud.plm.system.dto.BizI18nLocaleSaveRequest;
import com.huaweicloud.plm.system.dto.BizI18nMessageSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaFactoryParam;
import com.huaweicloud.plm.system.entity.OaI18nLocale;
import com.huaweicloud.plm.system.entity.OaI18nMessage;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaFactoryParamService;
import com.huaweicloud.plm.system.service.OaI18nService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 国际化与多工厂参数接口（OA-DEV-084）：语言区域、语言包与工厂参数维护。
 */
@RestController
@RequestMapping("/oa/system/i18n")
@RequiredArgsConstructor
public class OaI18nController {

    private final OaI18nService i18nService;
    private final OaFactoryParamService factoryParamService;

    /** 语言区域分页。 */
    @GetMapping("/locales")
    @RequirePermission("oa:i18n:list")
    public ApiResponse<PageResult<OaI18nLocale>> pageLocales(OaBizFlowQuery query) {
        return ApiResponse.success(i18nService.pageLocale(query));
    }

    /** 启用中的语言区域列表。 */
    @GetMapping("/locales/enabled")
    @RequirePermission("oa:i18n:list")
    public ApiResponse<List<OaI18nLocale>> listEnabledLocales() {
        return ApiResponse.success(i18nService.listEnabledLocale());
    }

    @PostMapping("/locales")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Long> createLocale(@Valid @RequestBody BizI18nLocaleSaveRequest request) {
        return ApiResponse.success(i18nService.saveLocale(null, request));
    }

    @PutMapping("/locales/{id}")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Void> updateLocale(@PathVariable Long id, @Valid @RequestBody BizI18nLocaleSaveRequest request) {
        i18nService.saveLocale(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/locales/{id}")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Void> deleteLocale(@PathVariable Long id) {
        i18nService.deleteLocale(id);
        return ApiResponse.success();
    }

    /** 语言包条目分页。 */
    @GetMapping("/messages")
    @RequirePermission("oa:i18n:list")
    public ApiResponse<PageResult<OaI18nMessage>> pageMessages(OaBizFlowQuery query) {
        return ApiResponse.success(i18nService.pageMessage(query));
    }

    /** 按区域加载语言包。 */
    @GetMapping("/messages/by-locale")
    @RequirePermission("oa:i18n:list")
    public ApiResponse<List<OaI18nMessage>> listMessagesByLocale(@RequestParam(required = false) String localeCode) {
        return ApiResponse.success(i18nService.listMessageByLocale(localeCode));
    }

    @PostMapping("/messages")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Long> createMessage(@Valid @RequestBody BizI18nMessageSaveRequest request) {
        return ApiResponse.success(i18nService.saveMessage(null, request));
    }

    @PutMapping("/messages/{id}")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Void> updateMessage(@PathVariable Long id, @Valid @RequestBody BizI18nMessageSaveRequest request) {
        i18nService.saveMessage(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/messages/{id}")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Void> deleteMessage(@PathVariable Long id) {
        i18nService.deleteMessage(id);
        return ApiResponse.success();
    }

    /** 工厂参数分页。 */
    @GetMapping("/factory-params")
    @RequirePermission("oa:i18n:list")
    public ApiResponse<PageResult<OaFactoryParam>> pageFactoryParams(OaBizFlowQuery query) {
        return ApiResponse.success(factoryParamService.page(query));
    }

    /** 按工厂查询参数。 */
    @GetMapping("/factory-params/by-factory")
    @RequirePermission("oa:i18n:list")
    public ApiResponse<List<OaFactoryParam>> listFactoryParams(@RequestParam(required = false) String factoryCode) {
        return ApiResponse.success(factoryParamService.listByFactory(factoryCode));
    }

    @PostMapping("/factory-params")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Long> createFactoryParam(@Valid @RequestBody BizFactoryParamSaveRequest request) {
        return ApiResponse.success(factoryParamService.save(null, request));
    }

    @PutMapping("/factory-params/{id}")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Void> updateFactoryParam(@PathVariable Long id, @Valid @RequestBody BizFactoryParamSaveRequest request) {
        factoryParamService.save(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/factory-params/{id}")
    @RequirePermission("oa:i18n:manage")
    public ApiResponse<Void> deleteFactoryParam(@PathVariable Long id) {
        factoryParamService.delete(id);
        return ApiResponse.success();
    }
}
