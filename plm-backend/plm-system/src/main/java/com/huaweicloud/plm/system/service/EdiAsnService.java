package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiAsnDetailResponse;
import com.huaweicloud.plm.system.dto.EdiAsnLineSaveRequest;
import com.huaweicloud.plm.system.dto.EdiAsnQuery;
import com.huaweicloud.plm.system.dto.EdiAsnSaveRequest;
import com.huaweicloud.plm.system.entity.EdiAsn;
import com.huaweicloud.plm.system.entity.EdiAsnLine;
import com.huaweicloud.plm.system.entity.EdiDemandDispatch;
import com.huaweicloud.plm.system.mapper.EdiAsnLineMapper;
import com.huaweicloud.plm.system.mapper.EdiAsnMapper;
import com.huaweicloud.plm.system.mapper.EdiDemandDispatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ASN 交付服务（N6，DEV-072）。
 */
@Service
@RequiredArgsConstructor
public class EdiAsnService {

    private static final String DEFAULT_TRANS_CODE = "856";
    private static final String DEFAULT_ASN_TYPE = "OUTBOUND";
    private static final String STATUS_CREATED = "CREATED";
    private static final String STATUS_SENT = "SENT";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String DIRECTION_OUTBOUND = "OUTBOUND";

    private final EdiAsnMapper ediAsnMapper;
    private final EdiAsnLineMapper ediAsnLineMapper;
    private final EdiDemandDispatchMapper ediDemandDispatchMapper;
    private final EdiSupportService ediSupport;

    public PageResult<EdiAsn> page(EdiAsnQuery query) {
        Page<EdiAsn> page = query.toPage();
        ediAsnMapper.selectPage(page, Wrappers.<EdiAsn>lambdaQuery()
                .eq(StringUtils.hasText(query.getAsnNo()), EdiAsn::getAsnNo, query.getAsnNo())
                .eq(StringUtils.hasText(query.getDemandNo()), EdiAsn::getDemandNo, query.getDemandNo())
                .eq(StringUtils.hasText(query.getSupplierCode()), EdiAsn::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getCustomerCode()), EdiAsn::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getStatus()), EdiAsn::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiAsn::getAsnNo, query.getKeyword()).or()
                        .like(EdiAsn::getDemandNo, query.getKeyword()).or()
                        .like(EdiAsn::getTrackingNo, query.getKeyword()))
                .orderByDesc(EdiAsn::getId));
        return PageResult.of(page);
    }

    public EdiAsnDetailResponse detail(String asnNo) {
        EdiAsn asn = requireAsn(asnNo);
        EdiAsnDetailResponse response = new EdiAsnDetailResponse();
        response.setAsn(asn);
        response.setLines(ediAsnLineMapper.selectList(Wrappers.<EdiAsnLine>lambdaQuery()
                .eq(EdiAsnLine::getAsnId, asn.getId())
                .orderByAsc(EdiAsnLine::getLineNo)));
        return response;
    }

    public List<EdiAsn> listByDemand(String demandNo) {
        return ediAsnMapper.selectList(Wrappers.<EdiAsn>lambdaQuery()
                .eq(EdiAsn::getDemandNo, demandNo)
                .orderByDesc(EdiAsn::getId));
    }

    @Transactional
    public Long create(EdiAsnSaveRequest request) {
        String asnNo = StringUtils.hasText(request.getAsnNo()) ? request.getAsnNo() : ediSupport.nextNo("ASN");
        if (ediAsnMapper.selectCount(Wrappers.<EdiAsn>lambdaQuery().eq(EdiAsn::getAsnNo, asnNo)) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "ASN 编号已存在: " + asnNo);
        }

        EdiAsn asn = new EdiAsn();
        asn.setAsnNo(asnNo);
        asn.setDispatchNo(request.getDispatchNo());
        asn.setDemandNo(request.getDemandNo());
        asn.setTransCode(StringUtils.hasText(request.getTransCode()) ? request.getTransCode() : DEFAULT_TRANS_CODE);
        asn.setAsnType(StringUtils.hasText(request.getAsnType()) ? request.getAsnType() : DEFAULT_ASN_TYPE);
        asn.setCustomerCode(request.getCustomerCode());
        asn.setSupplierCode(request.getSupplierCode());
        asn.setShipTo(request.getShipTo());
        asn.setCarrier(request.getCarrier());
        asn.setTrackingNo(request.getTrackingNo());
        asn.setPlateNo(request.getPlateNo());
        asn.setShipDate(request.getShipDate());
        asn.setEtaDate(request.getEtaDate());
        asn.setStatus(STATUS_CREATED);
        asn.setRemark(request.getRemark());

        List<EdiAsnLineSaveRequest> lines = request.getLines();
        BigDecimal totalQty = BigDecimal.ZERO;
        if (lines != null) {
            for (EdiAsnLineSaveRequest line : lines) {
                if (line.getQty() != null) {
                    totalQty = totalQty.add(line.getQty());
                }
            }
        }
        asn.setTotalQty(totalQty);
        asn.setPackageCount(request.getPackageCount() != null ? request.getPackageCount()
                : (lines == null ? 0 : lines.size()));

        EdiDemandDispatch dispatch = null;
        if (StringUtils.hasText(request.getDispatchNo())) {
            dispatch = ediDemandDispatchMapper.selectOne(Wrappers.<EdiDemandDispatch>lambdaQuery()
                    .eq(EdiDemandDispatch::getDispatchNo, request.getDispatchNo()));
            if (dispatch != null) {
                if (!StringUtils.hasText(asn.getDemandNo())) {
                    asn.setDemandNo(dispatch.getDemandNo());
                }
                if (!StringUtils.hasText(asn.getSupplierCode())) {
                    asn.setSupplierCode(dispatch.getSupplierCode());
                }
            }
        }

        ediAsnMapper.insert(asn);

        if (lines != null) {
            String fallbackMaterial = resolveFallbackMaterial(lines, dispatch);
            for (int i = 0; i < lines.size(); i++) {
                EdiAsnLineSaveRequest lineRequest = lines.get(i);
                EdiAsnLine line = new EdiAsnLine();
                line.setAsnId(asn.getId());
                line.setAsnNo(asn.getAsnNo());
                line.setLineNo(lineRequest.getLineNo() != null ? lineRequest.getLineNo() : i + 1);
                line.setMaterialCode(StringUtils.hasText(lineRequest.getMaterialCode())
                        ? lineRequest.getMaterialCode() : fallbackMaterial);
                line.setQty(lineRequest.getQty() == null ? BigDecimal.ZERO : lineRequest.getQty());
                line.setUnit(lineRequest.getUnit());
                line.setBatchNo(lineRequest.getBatchNo());
                line.setPackageCode(lineRequest.getPackageCode());
                line.setBoxCode(lineRequest.getBoxCode());
                line.setRemark(lineRequest.getRemark());
                ediAsnLineMapper.insert(line);
            }
        }

        ediSupport.writeLog(asn.getDemandNo(), asn.getCustomerCode(), asn.getTransCode(),
                DIRECTION_OUTBOUND, "ASN_CREATE", "SUCCESS", "创建 ASN：" + asnNo, asnNo);
        return asn.getId();
    }

    @Transactional
    public void update(String asnNo, EdiAsnSaveRequest request) {
        EdiAsn asn = requireAsn(asnNo);
        asn.setDispatchNo(request.getDispatchNo());
        asn.setDemandNo(request.getDemandNo());
        if (StringUtils.hasText(request.getTransCode())) {
            asn.setTransCode(request.getTransCode());
        }
        if (StringUtils.hasText(request.getAsnType())) {
            asn.setAsnType(request.getAsnType());
        }
        asn.setCustomerCode(request.getCustomerCode());
        asn.setSupplierCode(request.getSupplierCode());
        asn.setShipTo(request.getShipTo());
        asn.setCarrier(request.getCarrier());
        asn.setTrackingNo(request.getTrackingNo());
        asn.setPlateNo(request.getPlateNo());
        asn.setShipDate(request.getShipDate());
        asn.setEtaDate(request.getEtaDate());
        if (request.getPackageCount() != null) {
            asn.setPackageCount(request.getPackageCount());
        }
        asn.setRemark(request.getRemark());

        List<EdiAsnLineSaveRequest> lines = request.getLines();
        if (lines != null) {
            ediAsnLineMapper.delete(Wrappers.<EdiAsnLine>lambdaQuery().eq(EdiAsnLine::getAsnId, asn.getId()));
            String fallbackMaterial = resolveFallbackMaterial(lines, null);
            BigDecimal totalQty = BigDecimal.ZERO;
            for (int i = 0; i < lines.size(); i++) {
                EdiAsnLineSaveRequest lineRequest = lines.get(i);
                EdiAsnLine line = new EdiAsnLine();
                line.setAsnId(asn.getId());
                line.setAsnNo(asn.getAsnNo());
                line.setLineNo(lineRequest.getLineNo() != null ? lineRequest.getLineNo() : i + 1);
                line.setMaterialCode(StringUtils.hasText(lineRequest.getMaterialCode())
                        ? lineRequest.getMaterialCode() : fallbackMaterial);
                line.setQty(lineRequest.getQty() == null ? BigDecimal.ZERO : lineRequest.getQty());
                line.setUnit(lineRequest.getUnit());
                line.setBatchNo(lineRequest.getBatchNo());
                line.setPackageCode(lineRequest.getPackageCode());
                line.setBoxCode(lineRequest.getBoxCode());
                line.setRemark(lineRequest.getRemark());
                ediAsnLineMapper.insert(line);
                totalQty = totalQty.add(line.getQty());
            }
            asn.setTotalQty(totalQty);
        }

        ediAsnMapper.updateById(asn);
    }

    /**
     * ASN 发送给客户。真实 EDI 通道对接为占位实现，后续接入伙伴通道后再发送 856 报文。
     */
    public void send(String asnNo) {
        EdiAsn asn = requireAsn(asnNo);
        asn.setStatus(STATUS_SENT);
        asn.setSendAt(LocalDateTime.now());
        ediAsnMapper.updateById(asn);
        ediSupport.writeLog(null, asn.getCustomerCode(),
                StringUtils.hasText(asn.getTransCode()) ? asn.getTransCode() : DEFAULT_TRANS_CODE,
                DIRECTION_OUTBOUND, "ASN_SEND", "SUCCESS", "ASN 已发送给客户", asnNo);
    }

    public void cancel(String asnNo) {
        EdiAsn asn = requireAsn(asnNo);
        asn.setStatus(STATUS_CANCELLED);
        ediAsnMapper.updateById(asn);
        ediSupport.writeLog(null, asn.getCustomerCode(),
                StringUtils.hasText(asn.getTransCode()) ? asn.getTransCode() : DEFAULT_TRANS_CODE,
                DIRECTION_OUTBOUND, "ASN_CANCEL", "SUCCESS", "ASN 已作废：" + asnNo, asnNo);
    }

    public EdiAsn requireAsn(String asnNo) {
        EdiAsn asn = ediAsnMapper.selectOne(Wrappers.<EdiAsn>lambdaQuery().eq(EdiAsn::getAsnNo, asnNo));
        if (asn == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "ASN 不存在: " + asnNo);
        }
        return asn;
    }

    /**
     * 明细物料回填来源：第一条已填物料的明细，否则取分发记录的物料编码。
     */
    private String resolveFallbackMaterial(List<EdiAsnLineSaveRequest> lines, EdiDemandDispatch dispatch) {
        for (EdiAsnLineSaveRequest line : lines) {
            if (StringUtils.hasText(line.getMaterialCode())) {
                return line.getMaterialCode();
            }
        }
        return dispatch == null ? null : dispatch.getMaterialCode();
    }
}
