package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.MfgShipReleaseRequest;
import com.huaweicloud.plm.system.dto.MfgShipScanLogQuery;
import com.huaweicloud.plm.system.dto.MfgShipScanRequest;
import com.huaweicloud.plm.system.dto.MfgShipScanResponse;
import com.huaweicloud.plm.system.dto.MfgShipmentDetailResponse;
import com.huaweicloud.plm.system.dto.MfgShipmentQuery;
import com.huaweicloud.plm.system.dto.MfgShipmentSaveRequest;
import com.huaweicloud.plm.system.entity.MfgShipScanLog;
import com.huaweicloud.plm.system.entity.MfgShipment;
import com.huaweicloud.plm.system.entity.MfgShipmentLine;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.MfgShipmentService;
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
 * 出货与发货放行接口（N8，DEV-090/091/092）：订单匹配、扫码防错、放行与 ASN。
 */
@RestController
@RequestMapping("/mfg/shipments")
@RequiredArgsConstructor
public class MfgShipmentController {

    private final MfgShipmentService mfgShipmentService;

    @GetMapping
    @RequirePermission("mfg:shipment:list")
    public ApiResponse<PageResult<MfgShipment>> page(MfgShipmentQuery query) {
        return ApiResponse.success(mfgShipmentService.page(query));
    }

    @GetMapping("/{shipmentNo}")
    @RequirePermission("mfg:shipment:list")
    public ApiResponse<MfgShipmentDetailResponse> detail(@PathVariable String shipmentNo) {
        return ApiResponse.success(mfgShipmentService.detail(shipmentNo));
    }

    @GetMapping("/{shipmentNo}/lines")
    @RequirePermission("mfg:shipment:list")
    public ApiResponse<List<MfgShipmentLine>> listLines(@PathVariable String shipmentNo) {
        return ApiResponse.success(mfgShipmentService.listLines(shipmentNo));
    }

    @GetMapping("/batch/{batchNo}")
    @RequirePermission("mfg:shipment:list")
    public ApiResponse<List<MfgShipment>> listByBatch(@PathVariable String batchNo) {
        return ApiResponse.success(mfgShipmentService.listByBatch(batchNo));
    }

    @GetMapping("/scan-logs")
    @RequirePermission("mfg:shipment:list")
    public ApiResponse<PageResult<MfgShipScanLog>> pageScanLogs(MfgShipScanLogQuery query) {
        return ApiResponse.success(mfgShipmentService.pageScanLogs(query));
    }

    @PostMapping
    @RequirePermission("mfg:shipment:save")
    public ApiResponse<Long> create(@Valid @RequestBody MfgShipmentSaveRequest request) {
        return ApiResponse.success(mfgShipmentService.create(request));
    }

    @PutMapping("/{shipmentNo}")
    @RequirePermission("mfg:shipment:save")
    public ApiResponse<Void> update(@PathVariable String shipmentNo,
                                    @Valid @RequestBody MfgShipmentSaveRequest request) {
        mfgShipmentService.update(shipmentNo, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/{shipmentNo}")
    @RequirePermission("mfg:shipment:save")
    public ApiResponse<Void> delete(@PathVariable String shipmentNo) {
        mfgShipmentService.delete(shipmentNo);
        return ApiResponse.success();
    }

    @PostMapping("/{shipmentNo}/scan")
    @RequirePermission("mfg:shipment:scan")
    public ApiResponse<MfgShipScanResponse> scan(@PathVariable String shipmentNo,
                                                 @Valid @RequestBody MfgShipScanRequest request) {
        return ApiResponse.success(mfgShipmentService.scan(shipmentNo, request));
    }

    @PostMapping("/{shipmentNo}/release")
    @RequirePermission("mfg:shipment:release")
    public ApiResponse<MfgShipment> release(@PathVariable String shipmentNo,
                                            @RequestBody(required = false) MfgShipReleaseRequest request) {
        return ApiResponse.success(mfgShipmentService.release(shipmentNo, request));
    }

    @PostMapping("/{shipmentNo}/asn")
    @RequirePermission("mfg:shipment:release")
    public ApiResponse<String> createAsn(@PathVariable String shipmentNo) {
        return ApiResponse.success(mfgShipmentService.createAsn(mfgShipmentService.requireShipment(shipmentNo)));
    }

    @PostMapping("/{shipmentNo}/asn/send")
    @RequirePermission("mfg:shipment:release")
    public ApiResponse<MfgShipment> sendAsn(@PathVariable String shipmentNo) {
        return ApiResponse.success(mfgShipmentService.sendAsn(mfgShipmentService.requireShipment(shipmentNo)));
    }

    @PostMapping("/{shipmentNo}/ship")
    @RequirePermission("mfg:shipment:release")
    public ApiResponse<MfgShipment> ship(@PathVariable String shipmentNo) {
        return ApiResponse.success(mfgShipmentService.ship(shipmentNo));
    }

    @PostMapping("/{shipmentNo}/cancel")
    @RequirePermission("mfg:shipment:save")
    public ApiResponse<Void> cancel(@PathVariable String shipmentNo) {
        mfgShipmentService.cancel(shipmentNo);
        return ApiResponse.success();
    }
}
