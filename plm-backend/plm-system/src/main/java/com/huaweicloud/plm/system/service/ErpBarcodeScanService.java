package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpBarcodeScanQuery;
import com.huaweicloud.plm.system.dto.ErpBarcodeScanSaveRequest;
import com.huaweicloud.plm.system.entity.ErpBarcodeScan;
import com.huaweicloud.plm.system.mapper.ErpBarcodeScanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 条码管理—扫描校验（对应 G3-N7a ERP 条码管理）：
 * 扫描记录登记、分页查询与删除。
 * 扫描单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpBarcodeScanService {

    private static final String DEFAULT_SCAN_NO_PREFIX = "BCS";
    private static final String DEFAULT_SCAN_TYPE = "RECEIPT";
    private static final String DEFAULT_SCAN_RESULT = "PASS";

    private final ErpBarcodeScanMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询扫描记录：扫描类型/扫描结果/条码编号精确，扫描单号/条码编号/物料编码/扫描人模糊，按主键倒序。 */
    public PageResult<ErpBarcodeScan> page(ErpBarcodeScanQuery query) {
        Page<ErpBarcodeScan> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpBarcodeScan>lambdaQuery()
                .eq(StringUtils.hasText(query.getScanType()),
                        ErpBarcodeScan::getScanType, query.getScanType())
                .eq(StringUtils.hasText(query.getScanResult()),
                        ErpBarcodeScan::getScanResult, query.getScanResult())
                .eq(StringUtils.hasText(query.getBarcodeNo()),
                        ErpBarcodeScan::getBarcodeNo, query.getBarcodeNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpBarcodeScan::getScanNo, query.getKeyword()).or()
                        .like(ErpBarcodeScan::getBarcodeNo, query.getKeyword()).or()
                        .like(ErpBarcodeScan::getMaterialCode, query.getKeyword()).or()
                        .like(ErpBarcodeScan::getScanner, query.getKeyword()))
                .orderByDesc(ErpBarcodeScan::getId));
        return PageResult.of(page);
    }

    public ErpBarcodeScan detail(Long id) {
        return require(id);
    }

    /** 新增或更新扫描记录：新增时回填默认扫描类型/扫描数量/扫描结果与组织，扫描单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpBarcodeScanSaveRequest request) {
        ErpBarcodeScan entity;
        if (id == null) {
            entity = new ErpBarcodeScan();
            entity.setScanNo(StringUtils.hasText(request.getScanNo())
                    ? request.getScanNo() : flowSupport.nextBizNo(DEFAULT_SCAN_NO_PREFIX));
            entity.setScanType(StringUtils.hasText(request.getScanType())
                    ? request.getScanType() : DEFAULT_SCAN_TYPE);
            entity.setScanQty(request.getScanQty() != null
                    ? request.getScanQty() : BigDecimal.ZERO);
            entity.setScanResult(StringUtils.hasText(request.getScanResult())
                    ? request.getScanResult() : DEFAULT_SCAN_RESULT);
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

    /** 删除扫描记录：物理删除以释放扫描单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpBarcodeScan require(Long id) {
        ErpBarcodeScan entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "扫描记录不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpBarcodeScan entity, ErpBarcodeScanSaveRequest request) {
        if (StringUtils.hasText(request.getScanNo())) {
            entity.setScanNo(request.getScanNo());
        }
        if (StringUtils.hasText(request.getBarcodeNo())) {
            entity.setBarcodeNo(request.getBarcodeNo());
        }
        if (StringUtils.hasText(request.getScanType())) {
            entity.setScanType(request.getScanType());
        }
        if (StringUtils.hasText(request.getBizNo())) {
            entity.setBizNo(request.getBizNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (request.getScanQty() != null) {
            entity.setScanQty(request.getScanQty());
        }
        if (request.getScanTime() != null) {
            entity.setScanTime(request.getScanTime());
        }
        if (StringUtils.hasText(request.getScanner())) {
            entity.setScanner(request.getScanner());
        }
        if (StringUtils.hasText(request.getScanResult())) {
            entity.setScanResult(request.getScanResult());
        }
        if (StringUtils.hasText(request.getFailReason())) {
            entity.setFailReason(request.getFailReason());
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
