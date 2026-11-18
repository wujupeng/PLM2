package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.BarcodeMatrixRequest;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.BarcodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 标签条码接口（N5）：Data Matrix / 二维码 / CODE128 生成与渲染。
 */
@RestController
@RequestMapping("/label/barcode")
@RequiredArgsConstructor
public class BarcodeController {

    private final BarcodeService barcodeService;

    @GetMapping("/base64")
    @RequirePermission("label:template:list")
    public ApiResponse<String> base64(@RequestParam String content,
                                      @RequestParam(required = false) String barcodeType,
                                      @RequestParam(required = false) Integer sizePx) {
        return ApiResponse.success(barcodeService.toBase64Png(content, sizePx == null ? 0 : sizePx, barcodeType));
    }

    @GetMapping("/matrix")
    @RequirePermission("label:template:list")
    public ApiResponse<List<String>> matrix(@RequestParam String content,
                                            @RequestParam(required = false) String barcodeType) {
        return ApiResponse.success(barcodeService.toMatrix(content, barcodeType));
    }

    @GetMapping("/svg")
    @RequirePermission("label:template:list")
    public ApiResponse<String> svg(@RequestParam String content,
                                   @RequestParam(required = false) String barcodeType,
                                   @RequestParam(required = false) Integer moduleSize) {
        return ApiResponse.success(barcodeService.toSvg(content, moduleSize == null ? 0 : moduleSize, barcodeType));
    }

    @GetMapping("/png")
    @RequirePermission("label:template:list")
    public ResponseEntity<byte[]> png(@RequestParam String content,
                                      @RequestParam(required = false) String barcodeType,
                                      @RequestParam(required = false) Integer sizePx) {
        byte[] bytes = barcodeService.toPng(content, sizePx == null ? 0 : sizePx, barcodeType);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(bytes);
    }

    @PostMapping("/matrix/batch")
    @RequirePermission("label:template:list")
    public ApiResponse<Map<String, List<String>>> matrixBatch(@Valid @RequestBody BarcodeMatrixRequest request) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        result.put(request.getContent(), barcodeService.toMatrix(request.getContent(), request.getBarcodeType()));
        return ApiResponse.success(result);
    }
}
