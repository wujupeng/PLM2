package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizConnectorSyncLogSaveRequest;
import com.huaweicloud.plm.system.dto.BizIntegrationConnectorSaveRequest;
import com.huaweicloud.plm.system.dto.BizMasterDataMappingSaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaConnectorSyncLog;
import com.huaweicloud.plm.system.entity.OaIntegrationConnector;
import com.huaweicloud.plm.system.entity.OaMasterDataMapping;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaIntegrationConnectorService;
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

/**
 * 集成连接器接口（OA-DEV-089 ~ OA-DEV-093）：PLM/ERP/MES/QMS/EDI 连接器、同步记录（来源标识/时间戳/回执）
 * 与主数据映射（权威源与同步方向）。
 */
@RestController
@RequestMapping("/oa/integration")
@RequiredArgsConstructor
public class OaIntegrationConnectorController {

    private final OaIntegrationConnectorService connectorService;

    // ================= 连接器 =================

    @GetMapping("/connectors")
    @RequirePermission("oa:integration:connector:list")
    public ApiResponse<PageResult<OaIntegrationConnector>> pageConnectors(OaIntegrationQuery query) {
        return ApiResponse.success(connectorService.pageConnectors(query));
    }

    @GetMapping("/connectors/enabled")
    @RequirePermission("oa:integration:connector:list")
    public ApiResponse<List<OaIntegrationConnector>> listEnabledConnectors() {
        return ApiResponse.success(connectorService.listEnabledConnectors());
    }

    @GetMapping("/connectors/{id}")
    @RequirePermission("oa:integration:connector:list")
    public ApiResponse<OaIntegrationConnector> detailConnector(@PathVariable Long id) {
        return ApiResponse.success(connectorService.detailConnector(id));
    }

    @PostMapping("/connectors")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Long> createConnector(@Valid @RequestBody BizIntegrationConnectorSaveRequest request) {
        return ApiResponse.success(connectorService.saveConnector(null, request));
    }

    @PutMapping("/connectors/{id}")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Void> updateConnector(@PathVariable Long id,
                                             @Valid @RequestBody BizIntegrationConnectorSaveRequest request) {
        connectorService.saveConnector(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/connectors/{id}")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Void> deleteConnector(@PathVariable Long id) {
        connectorService.deleteConnector(id);
        return ApiResponse.success();
    }

    // ================= 同步记录 =================

    @GetMapping("/sync-logs")
    @RequirePermission("oa:integration:connector:list")
    public ApiResponse<PageResult<OaConnectorSyncLog>> pageSyncLogs(OaIntegrationQuery query) {
        return ApiResponse.success(connectorService.pageSyncLogs(query));
    }

    @GetMapping("/sync-logs/{id}")
    @RequirePermission("oa:integration:connector:list")
    public ApiResponse<OaConnectorSyncLog> detailSyncLog(@PathVariable Long id) {
        return ApiResponse.success(connectorService.detailSyncLog(id));
    }

    @PostMapping("/sync-logs")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Long> recordSyncLog(@Valid @RequestBody BizConnectorSyncLogSaveRequest request) {
        return ApiResponse.success(connectorService.recordSyncLog(request));
    }

    /** 触发一次连接器同步。 */
    @PostMapping("/connectors/{id}/sync")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Long> performSync(@PathVariable Long id,
                                         @Valid @RequestBody BizConnectorSyncLogSaveRequest request) {
        return ApiResponse.success(connectorService.performSync(id, request));
    }

    @DeleteMapping("/sync-logs/{id}")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Void> deleteSyncLog(@PathVariable Long id) {
        connectorService.deleteSyncLog(id);
        return ApiResponse.success();
    }

    // ================= 主数据映射 =================

    @GetMapping("/mappings")
    @RequirePermission("oa:integration:connector:list")
    public ApiResponse<PageResult<OaMasterDataMapping>> pageMappings(OaIntegrationQuery query) {
        return ApiResponse.success(connectorService.pageMappings(query));
    }

    @GetMapping("/mappings/{id}")
    @RequirePermission("oa:integration:connector:list")
    public ApiResponse<OaMasterDataMapping> detailMapping(@PathVariable Long id) {
        return ApiResponse.success(connectorService.detailMapping(id));
    }

    @PostMapping("/mappings")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Long> createMapping(@Valid @RequestBody BizMasterDataMappingSaveRequest request) {
        return ApiResponse.success(connectorService.saveMapping(null, request));
    }

    @PutMapping("/mappings/{id}")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Void> updateMapping(@PathVariable Long id,
                                           @Valid @RequestBody BizMasterDataMappingSaveRequest request) {
        connectorService.saveMapping(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/mappings/{id}")
    @RequirePermission("oa:integration:connector:manage")
    public ApiResponse<Void> deleteMapping(@PathVariable Long id) {
        connectorService.deleteMapping(id);
        return ApiResponse.success();
    }
}
