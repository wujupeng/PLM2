package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiAsnLineSaveRequest;
import com.huaweicloud.plm.system.dto.EdiAsnSaveRequest;
import com.huaweicloud.plm.system.dto.MfgShipScanRequest;
import com.huaweicloud.plm.system.dto.MfgShipScanResponse;
import com.huaweicloud.plm.system.dto.MfgShipScanLogQuery;
import com.huaweicloud.plm.system.dto.MfgShipmentDetailResponse;
import com.huaweicloud.plm.system.dto.MfgShipmentLineRequest;
import com.huaweicloud.plm.system.dto.MfgShipmentQuery;
import com.huaweicloud.plm.system.dto.MfgShipmentSaveRequest;
import com.huaweicloud.plm.system.dto.MfgShipReleaseRequest;
import com.huaweicloud.plm.system.entity.MfgPackage;
import com.huaweicloud.plm.system.entity.MfgProductionBatch;
import com.huaweicloud.plm.system.entity.MfgShipScanLog;
import com.huaweicloud.plm.system.entity.MfgShipment;
import com.huaweicloud.plm.system.entity.MfgShipmentLine;
import com.huaweicloud.plm.system.entity.MfgTraceBinding;
import com.huaweicloud.plm.system.mapper.MfgProductionBatchMapper;
import com.huaweicloud.plm.system.mapper.MfgShipScanLogMapper;
import com.huaweicloud.plm.system.mapper.MfgShipmentLineMapper;
import com.huaweicloud.plm.system.mapper.MfgShipmentMapper;
import com.huaweicloud.plm.system.mapper.MfgTraceBindingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 出货订单匹配、出货扫码防错与发货放行服务（N8，DEV-090/091/092）。
 * 扫码校验：错料号、错版本、错客户、重复扫描、超数量均可阻断并留痕；放行后按配置生成 ASN。
 */
@Service
@RequiredArgsConstructor
public class MfgShipmentService {

    private static final String STATUS_CREATED = "CREATED";
    private static final String STATUS_VERIFIED = "VERIFIED";
    private static final String STATUS_RELEASED = "RELEASED";
    private static final String STATUS_SHIPPED = "SHIPPED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String RELEASE_UNRELEASED = "UNRELEASED";
    private static final String RELEASE_RELEASED = "RELEASED";
    private static final String SCAN_PASS = "PASS";
    private static final String SCAN_BLOCKED = "BLOCKED";
    private static final String SCAN_TYPE_PACKAGE = "PACKAGE";
    private static final String SCAN_TYPE_SERIAL = "SERIAL";
    private static final String ASN_STATUS_CREATED = "CREATED";
    private static final String ASN_STATUS_SENT = "SENT";

    private final MfgShipmentMapper mfgShipmentMapper;
    private final MfgShipmentLineMapper mfgShipmentLineMapper;
    private final MfgShipScanLogMapper mfgShipScanLogMapper;
    private final MfgTraceBindingMapper mfgTraceBindingMapper;
    private final MfgProductionBatchMapper mfgProductionBatchMapper;
    private final MfgPackageService mfgPackageService;
    private final EdiAsnService ediAsnService;
    private final MfgSupportService mfgSupport;

    public PageResult<MfgShipment> page(MfgShipmentQuery query) {
        Page<MfgShipment> page = query.toPage();
        mfgShipmentMapper.selectPage(page, Wrappers.<MfgShipment>lambdaQuery()
                .eq(StringUtils.hasText(query.getShipmentNo()), MfgShipment::getShipmentNo, query.getShipmentNo())
                .eq(StringUtils.hasText(query.getCustomerCode()), MfgShipment::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getOrderNo()), MfgShipment::getOrderNo, query.getOrderNo())
                .eq(StringUtils.hasText(query.getProductCode()), MfgShipment::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getShipmentStatus()), MfgShipment::getShipmentStatus, query.getShipmentStatus())
                .eq(StringUtils.hasText(query.getReleaseStatus()), MfgShipment::getReleaseStatus, query.getReleaseStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MfgShipment::getShipmentNo, query.getShipmentNo() == null ? "" : query.getKeyword()).or()
                        .like(MfgShipment::getOrderNo, query.getKeyword()).or()
                        .like(MfgShipment::getCustomerName, query.getKeyword()))
                .orderByDesc(MfgShipment::getId));
        return PageResult.of(page);
    }

    public MfgShipmentDetailResponse detail(String shipmentNo) {
        MfgShipment shipment = requireShipment(shipmentNo);
        MfgShipmentDetailResponse response = new MfgShipmentDetailResponse();
        response.setShipment(shipment);
        response.setLines(listLines(shipmentNo));
        return response;
    }

    public List<MfgShipment> listByBatch(String batchNo) {
        List<MfgShipmentLine> lines = mfgShipmentLineMapper.selectList(Wrappers.<MfgShipmentLine>lambdaQuery()
                .eq(MfgShipmentLine::getBatchNo, batchNo));
        List<String> shipmentNos = new ArrayList<>();
        for (MfgShipmentLine line : lines) {
            if (!shipmentNos.contains(line.getShipmentNo())) {
                shipmentNos.add(line.getShipmentNo());
            }
        }
        if (shipmentNos.isEmpty()) {
            return List.of();
        }
        return mfgShipmentMapper.selectList(Wrappers.<MfgShipment>lambdaQuery()
                .in(MfgShipment::getShipmentNo, shipmentNos)
                .orderByDesc(MfgShipment::getId));
    }

    public List<MfgShipmentLine> listLines(String shipmentNo) {
        return mfgShipmentLineMapper.selectList(Wrappers.<MfgShipmentLine>lambdaQuery()
                .eq(MfgShipmentLine::getShipmentNo, shipmentNo)
                .orderByAsc(MfgShipmentLine::getLineNo)
                .orderByAsc(MfgShipmentLine::getId));
    }

    public PageResult<MfgShipScanLog> pageScanLogs(MfgShipScanLogQuery query) {
        Page<MfgShipScanLog> page = query.toPage();
        mfgShipScanLogMapper.selectPage(page, Wrappers.<MfgShipScanLog>lambdaQuery()
                .eq(StringUtils.hasText(query.getShipmentNo()), MfgShipScanLog::getShipmentNo, query.getShipmentNo())
                .eq(StringUtils.hasText(query.getScanCode()), MfgShipScanLog::getScanCode, query.getScanCode())
                .eq(StringUtils.hasText(query.getScanType()), MfgShipScanLog::getScanType, query.getScanType())
                .eq(StringUtils.hasText(query.getScanResult()), MfgShipScanLog::getScanResult, query.getScanResult())
                .eq(StringUtils.hasText(query.getCustomerCode()), MfgShipScanLog::getCustomerCode, query.getCustomerCode())
                .orderByDesc(MfgShipScanLog::getId));
        return PageResult.of(page);
    }

    public MfgShipment requireShipment(String shipmentNo) {
        MfgShipment shipment = mfgShipmentMapper.selectOne(Wrappers.<MfgShipment>lambdaQuery()
                .eq(MfgShipment::getShipmentNo, shipmentNo));
        if (shipment == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "出货单不存在: " + shipmentNo);
        }
        return shipment;
    }

    @Transactional
    public Long create(MfgShipmentSaveRequest request) {
        String shipmentNo = StringUtils.hasText(request.getShipmentNo())
                ? request.getShipmentNo() : mfgSupport.nextNo("SHP");
        if (mfgShipmentMapper.selectCount(Wrappers.<MfgShipment>lambdaQuery()
                .eq(MfgShipment::getShipmentNo, shipmentNo)) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "出货单号已存在: " + shipmentNo);
        }
        MfgShipment shipment = new MfgShipment();
        shipment.setShipmentNo(shipmentNo);
        applyFields(shipment, request);
        mfgShipmentMapper.insert(shipment);

        if (request.getLines() != null) {
            int index = 1;
            for (MfgShipmentLineRequest lineRequest : request.getLines()) {
                insertLine(shipment, lineRequest, index++);
            }
        }
        return shipment.getId();
    }

    @Transactional
    public void update(String shipmentNo, MfgShipmentSaveRequest request) {
        MfgShipment shipment = requireShipment(shipmentNo);
        if (STATUS_RELEASED.equals(shipment.getShipmentStatus()) || STATUS_SHIPPED.equals(shipment.getShipmentStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已放行/已发运的出货单不允许修改");
        }
        applyFields(shipment, request);
        if (request.getLines() != null) {
            mfgShipmentLineMapper.delete(Wrappers.<MfgShipmentLine>lambdaQuery()
                    .eq(MfgShipmentLine::getShipmentNo, shipmentNo));
            int index = 1;
            for (MfgShipmentLineRequest lineRequest : request.getLines()) {
                insertLine(shipment, lineRequest, index++);
            }
        }
        mfgShipmentMapper.updateById(shipment);
    }

    public void delete(String shipmentNo) {
        MfgShipment shipment = requireShipment(shipmentNo);
        if (STATUS_RELEASED.equals(shipment.getShipmentStatus()) || STATUS_SHIPPED.equals(shipment.getShipmentStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已放行/已发运的出货单不允许删除");
        }
        mfgShipmentLineMapper.delete(Wrappers.<MfgShipmentLine>lambdaQuery()
                .eq(MfgShipmentLine::getShipmentNo, shipmentNo));
        mfgShipmentMapper.deleteById(shipment.getId());
    }

    /**
     * 出货扫码复核（DEV-091）：逐件或按箱扫描，校验客户、料号、版本、数量，重复扫描与超数量阻断并留痕。
     */
    @Transactional
    public MfgShipScanResponse scan(String shipmentNo, MfgShipScanRequest request) {
        MfgShipment shipment = requireShipment(shipmentNo);
        String code = request.getScanCode().trim();

        String scanType;
        String productCode = null;
        String version = null;
        String batchNo = null;
        String serialNo = null;
        String packageNo = null;
        String customerCode = null;
        BigDecimal qty = request.getQty() != null ? request.getQty() : BigDecimal.ONE;
        String blockReason = null;

        MfgPackage pkg = mfgPackageService.findByIdentifier(code);
        if (pkg != null) {
            scanType = SCAN_TYPE_PACKAGE;
            productCode = pkg.getProductCode();
            batchNo = pkg.getBatchNo();
            packageNo = pkg.getPackageNo();
            customerCode = pkg.getCustomerCode();
            if (request.getQty() == null) {
                qty = pkg.getPackageQty() == null ? BigDecimal.ZERO : pkg.getPackageQty();
            }
        } else {
            MfgTraceBinding binding = mfgTraceBindingMapper.selectOne(Wrappers.<MfgTraceBinding>lambdaQuery()
                    .eq(MfgTraceBinding::getTraceCode, code)
                    .or()
                    .eq(MfgTraceBinding::getSerialNo, code)
                    .last("limit 1"));
            if (binding == null) {
                scanType = StringUtils.hasText(request.getScanType()) ? request.getScanType() : SCAN_TYPE_SERIAL;
                blockReason = "无法识别的追溯码/箱码：" + code;
            } else {
                scanType = SCAN_TYPE_SERIAL;
                productCode = binding.getProductCode();
                batchNo = binding.getBatchNo();
                serialNo = StringUtils.hasText(binding.getSerialNo()) ? binding.getSerialNo() : binding.getTraceCode();
            }
        }

        if (StringUtils.hasText(batchNo)) {
            MfgProductionBatch batch = mfgProductionBatchMapper.selectOne(Wrappers.<MfgProductionBatch>lambdaQuery()
                    .eq(MfgProductionBatch::getBatchNo, batchNo));
            if (batch != null) {
                if (!StringUtils.hasText(productCode)) {
                    productCode = batch.getProductCode();
                }
                version = batch.getProductVersion();
            }
        }

        BigDecimal limit = shipment.getPlannedQty() != null ? shipment.getPlannedQty() : shipment.getOrderQty();
        BigDecimal scanned = shipment.getScannedQty() == null ? BigDecimal.ZERO : shipment.getScannedQty();

        if (blockReason == null
                && !STATUS_CREATED.equals(shipment.getShipmentStatus())
                && !STATUS_VERIFIED.equals(shipment.getShipmentStatus())) {
            blockReason = "出货单当前状态不允许扫码：" + shipment.getShipmentStatus();
        }
        if (blockReason == null && StringUtils.hasText(shipment.getProductCode())
                && StringUtils.hasText(productCode) && !shipment.getProductCode().equals(productCode)) {
            blockReason = "错料号：扫描产品 " + productCode + " 与出货产品 " + shipment.getProductCode() + " 不一致";
        }
        if (blockReason == null && mfgSupport.configBool("mfg.shipment.version.match.strict", true)
                && StringUtils.hasText(shipment.getProductVersion()) && StringUtils.hasText(version)
                && !shipment.getProductVersion().equals(version)) {
            blockReason = "错版本：扫描版本 " + version + " 与出货版本 " + shipment.getProductVersion() + " 不一致";
        }
        if (blockReason == null && mfgSupport.configBool("mfg.shipment.customer.match.strict", true)
                && StringUtils.hasText(customerCode) && StringUtils.hasText(shipment.getCustomerCode())
                && !customerCode.equals(shipment.getCustomerCode())) {
            blockReason = "错客户：扫描客户 " + customerCode + " 与出货客户 " + shipment.getCustomerCode() + " 不一致";
        }
        if (blockReason == null && mfgSupport.configBool("mfg.shipment.dup.scan.block", true)
                && mfgShipScanLogMapper.selectCount(Wrappers.<MfgShipScanLog>lambdaQuery()
                .eq(MfgShipScanLog::getShipmentNo, shipmentNo)
                .eq(MfgShipScanLog::getScanCode, code)
                .eq(MfgShipScanLog::getScanResult, SCAN_PASS)) > 0) {
            blockReason = "重复扫描：该码已在本次出货中通过校验 " + code;
        }
        if (blockReason == null && mfgSupport.configBool("mfg.shipment.over.qty.block", true)
                && limit != null && scanned.add(qty).compareTo(limit) > 0) {
            blockReason = "超订单数量：已扫 " + scanned + " + 本次 " + qty + " 超过可交数量 " + limit;
        }

        boolean pass = blockReason == null;
        if (pass) {
            MfgShipmentLine line = new MfgShipmentLine();
            line.setShipmentNo(shipmentNo);
            line.setLineNo(listLines(shipmentNo).size() + 1);
            line.setOrderNo(shipment.getOrderNo());
            line.setProductCode(productCode);
            line.setProductVersion(version);
            line.setBatchNo(batchNo);
            line.setSerialNo(serialNo);
            line.setTraceCode(StringUtils.hasText(serialNo) ? serialNo : code);
            line.setPackageNo(packageNo);
            line.setQty(qty);
            line.setScanStatus("SCANNED");
            line.setLineStatus("OPEN");
            mfgShipmentLineMapper.insert(line);

            shipment.setScannedQty(scanned.add(qty));
            if (limit != null && shipment.getScannedQty().compareTo(limit) >= 0) {
                shipment.setShipmentStatus(STATUS_VERIFIED);
            }
            mfgShipmentMapper.updateById(shipment);
        }

        MfgShipScanLog log = new MfgShipScanLog();
        log.setLogNo(mfgSupport.nextNo("SSL"));
        log.setShipmentNo(shipmentNo);
        log.setScanCode(code);
        log.setScanType(scanType);
        log.setScanResult(pass ? SCAN_PASS : SCAN_BLOCKED);
        log.setBlockReason(blockReason);
        log.setCustomerCode(StringUtils.hasText(customerCode) ? customerCode : shipment.getCustomerCode());
        log.setProductCode(productCode);
        log.setProductVersion(version);
        log.setBatchNo(batchNo);
        log.setQty(qty);
        log.setOperator(request.getOperator());
        log.setScanTime(LocalDateTime.now());
        log.setRemark(request.getRemark());
        mfgShipScanLogMapper.insert(log);

        MfgShipScanResponse response = new MfgShipScanResponse();
        response.setScanResult(log.getScanResult());
        response.setBlockReason(blockReason);
        response.setScannedQty(shipment.getScannedQty());
        response.setPlannedQty(limit);
        response.setLog(log);
        return response;
    }

    /**
     * 发货放行（DEV-092）：未放行不能生成正式 ASN，放行后按配置生成并可选发送 ASN。
     */
    @Transactional
    public MfgShipment release(String shipmentNo, MfgShipReleaseRequest request) {
        MfgShipment shipment = requireShipment(shipmentNo);
        if (STATUS_CANCELLED.equals(shipment.getShipmentStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已取消的出货单不允许放行");
        }
        if (RELEASE_RELEASED.equals(shipment.getReleaseStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "出货单已放行: " + shipmentNo);
        }
        BigDecimal scanned = shipment.getScannedQty() == null ? BigDecimal.ZERO : shipment.getScannedQty();
        if (scanned.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "尚无扫码记录，不允许放行");
        }
        if (request != null) {
            if (StringUtils.hasText(request.getCarrier())) {
                shipment.setCarrier(request.getCarrier());
            }
            if (StringUtils.hasText(request.getVehicleNo())) {
                shipment.setVehicleNo(request.getVehicleNo());
            }
            if (StringUtils.hasText(request.getDriver())) {
                shipment.setDriver(request.getDriver());
            }
            if (StringUtils.hasText(request.getDriverPhone())) {
                shipment.setDriverPhone(request.getDriverPhone());
            }
            if (request.getShipDate() != null) {
                shipment.setShipDate(request.getShipDate());
            }
        }
        shipment.setReleaseStatus(RELEASE_RELEASED);
        shipment.setShipmentStatus(STATUS_RELEASED);
        shipment.setReleaseBy(com.huaweicloud.plm.common.security.UserContext.getUsername());
        shipment.setReleaseAt(LocalDateTime.now());
        if (shipment.getShipDate() == null) {
            shipment.setShipDate(java.time.LocalDate.now());
        }
        mfgShipmentMapper.updateById(shipment);

        if (mfgSupport.configBool("mfg.shipment.asn.auto.create", true)) {
            createAsn(shipment);
        }
        if (request != null && Boolean.TRUE.equals(request.getSendAsn())) {
            sendAsn(shipment);
        } else if (mfgSupport.configBool("mfg.shipment.asn.auto.send", false)) {
            sendAsn(shipment);
        }
        return requireShipment(shipmentNo);
    }

    /**
     * 生成 ASN（N6 EDI 856），回写 ASN 单号。
     */
    @Transactional
    public String createAsn(MfgShipment shipment) {
        if (StringUtils.hasText(shipment.getAsnNo())) {
            return shipment.getAsnNo();
        }
        EdiAsnSaveRequest asnRequest = new EdiAsnSaveRequest();
        asnRequest.setAsnNo(mfgSupport.nextNo("ASN"));
        asnRequest.setTransCode("856");
        asnRequest.setAsnType("OUTBOUND");
        asnRequest.setCustomerCode(shipment.getCustomerCode());
        asnRequest.setShipTo(shipment.getCustomerName());
        asnRequest.setCarrier(shipment.getCarrier());
        asnRequest.setPlateNo(shipment.getVehicleNo());
        asnRequest.setShipDate(shipment.getShipDate());
        asnRequest.setPackageCount(shipment.getPackageCount());
        asnRequest.setRemark("由 N8 出货单放行生成：" + shipment.getShipmentNo());

        List<EdiAsnLineSaveRequest> asnLines = new ArrayList<>();
        for (MfgShipmentLine line : listLines(shipment.getShipmentNo())) {
            EdiAsnLineSaveRequest asnLine = new EdiAsnLineSaveRequest();
            asnLine.setMaterialCode(StringUtils.hasText(line.getProductCode())
                    ? line.getProductCode() : shipment.getProductCode());
            asnLine.setQty(line.getQty());
            asnLine.setBatchNo(line.getBatchNo());
            asnLine.setPackageCode(line.getPackageNo());
            asnLine.setBoxCode(line.getPackageNo());
            asnLines.add(asnLine);
        }
        asnRequest.setLines(asnLines);

        ediAsnService.create(asnRequest);
        shipment.setAsnNo(asnRequest.getAsnNo());
        shipment.setAsnStatus(ASN_STATUS_CREATED);
        mfgShipmentMapper.updateById(shipment);
        return asnRequest.getAsnNo();
    }

    @Transactional
    public MfgShipment sendAsn(MfgShipment shipment) {
        if (!StringUtils.hasText(shipment.getAsnNo())) {
            createAsn(shipment);
        }
        ediAsnService.send(shipment.getAsnNo());
        shipment.setAsnStatus(ASN_STATUS_SENT);
        mfgShipmentMapper.updateById(shipment);
        return requireShipment(shipment.getShipmentNo());
    }

    /**
     * 确认发运：已放行的出货单标记为已发运并回填发运数量。
     */
    @Transactional
    public MfgShipment ship(String shipmentNo) {
        MfgShipment shipment = requireShipment(shipmentNo);
        if (!RELEASE_RELEASED.equals(shipment.getReleaseStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "出货单未放行，不允许发运");
        }
        shipment.setShipmentStatus(STATUS_SHIPPED);
        shipment.setShippedQty(shipment.getScannedQty());
        mfgShipmentMapper.updateById(shipment);
        return shipment;
    }

    @Transactional
    public void cancel(String shipmentNo) {
        MfgShipment shipment = requireShipment(shipmentNo);
        if (STATUS_SHIPPED.equals(shipment.getShipmentStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发运的出货单不允许取消");
        }
        shipment.setShipmentStatus(STATUS_CANCELLED);
        mfgShipmentMapper.updateById(shipment);
    }

    private void insertLine(MfgShipment shipment, MfgShipmentLineRequest lineRequest, int index) {
        MfgShipmentLine line = new MfgShipmentLine();
        line.setShipmentNo(shipment.getShipmentNo());
        line.setLineNo(lineRequest.getLineNo() != null ? lineRequest.getLineNo() : index);
        line.setOrderNo(StringUtils.hasText(lineRequest.getOrderNo()) ? lineRequest.getOrderNo() : shipment.getOrderNo());
        line.setOrderLineNo(lineRequest.getOrderLineNo());
        line.setProductCode(StringUtils.hasText(lineRequest.getProductCode())
                ? lineRequest.getProductCode() : shipment.getProductCode());
        line.setProductVersion(StringUtils.hasText(lineRequest.getProductVersion())
                ? lineRequest.getProductVersion() : shipment.getProductVersion());
        line.setBatchNo(lineRequest.getBatchNo());
        line.setSerialNo(lineRequest.getSerialNo());
        line.setTraceCode(lineRequest.getTraceCode());
        line.setPackageNo(lineRequest.getPackageNo());
        line.setQty(lineRequest.getQty() != null ? lineRequest.getQty() : BigDecimal.ZERO);
        line.setScanStatus(StringUtils.hasText(lineRequest.getScanStatus()) ? lineRequest.getScanStatus() : "PENDING");
        line.setLineStatus(StringUtils.hasText(lineRequest.getLineStatus()) ? lineRequest.getLineStatus() : "OPEN");
        line.setRemark(lineRequest.getRemark());
        mfgShipmentLineMapper.insert(line);
    }

    private void applyFields(MfgShipment shipment, MfgShipmentSaveRequest request) {
        shipment.setCustomerCode(request.getCustomerCode());
        shipment.setCustomerName(request.getCustomerName());
        shipment.setOrderNo(request.getOrderNo());
        shipment.setDeliveryPlanNo(request.getDeliveryPlanNo());
        shipment.setProductCode(request.getProductCode());
        shipment.setProductName(request.getProductName());
        shipment.setProductVersion(request.getProductVersion());
        shipment.setOrderQty(request.getOrderQty());
        shipment.setPlannedQty(request.getPlannedQty());
        if (request.getPackageCount() != null) {
            shipment.setPackageCount(request.getPackageCount());
        }
        shipment.setCarrier(request.getCarrier());
        shipment.setVehicleNo(request.getVehicleNo());
        shipment.setDriver(request.getDriver());
        shipment.setDriverPhone(request.getDriverPhone());
        shipment.setShipDate(request.getShipDate());
        if (!StringUtils.hasText(shipment.getShipmentStatus())) {
            shipment.setShipmentStatus(STATUS_CREATED);
        }
        if (!StringUtils.hasText(shipment.getReleaseStatus())) {
            shipment.setReleaseStatus(RELEASE_UNRELEASED);
        }
        if (shipment.getScannedQty() == null) {
            shipment.setScannedQty(BigDecimal.ZERO);
        }
        if (shipment.getShippedQty() == null) {
            shipment.setShippedQty(BigDecimal.ZERO);
        }
        if (request.getRemark() != null) {
            shipment.setRemark(request.getRemark());
        }
    }
}
