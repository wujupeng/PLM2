package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.BomBatchQuery;
import com.huaweicloud.plm.system.dto.BomImportRequest;
import com.huaweicloud.plm.system.dto.BomImportResult;
import com.huaweicloud.plm.system.dto.BomImportRow;
import com.huaweicloud.plm.system.dto.BomImportRowError;
import com.huaweicloud.plm.system.entity.BomHeader;
import com.huaweicloud.plm.system.entity.BomImportBatch;
import com.huaweicloud.plm.system.entity.BomImportError;
import com.huaweicloud.plm.system.entity.BomLine;
import com.huaweicloud.plm.system.mapper.BomHeaderMapper;
import com.huaweicloud.plm.system.mapper.BomImportBatchMapper;
import com.huaweicloud.plm.system.mapper.BomImportErrorMapper;
import com.huaweicloud.plm.system.mapper.BomLineMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * BOM 单阶导入服务（DEV-025）：源文件行数、成功/失败数可核对，原始来源可追溯。
 */
@Service
@RequiredArgsConstructor
public class BomImportService {

    private static final String DEFAULT_VERSION = "V1";
    private static final String STATUS_DRAFT = "draft";
    private static final String BATCH_STATUS_PENDING = "pending";
    private static final String BATCH_STATUS_SUCCESS = "success";
    private static final String BATCH_STATUS_PARTIAL = "partial";
    private static final String BATCH_STATUS_FAILED = "failed";

    private static final DateTimeFormatter BATCH_NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private final BomImportBatchMapper batchMapper;
    private final BomImportErrorMapper errorMapper;
    private final BomHeaderMapper headerMapper;
    private final BomLineMapper lineMapper;

    @Transactional
    public BomImportResult importBom(BomImportRequest request) {
        List<BomImportRow> rows = request.getRows() == null ? List.of() : request.getRows();

        BomImportBatch batch = new BomImportBatch();
        batch.setBatchNo(generateBatchNo());
        batch.setBomType(request.getBomType());
        batch.setSourceFile(request.getSourceFile());
        batch.setProductCode(request.getProductCode());
        batch.setTotalRows(rows.size());
        batch.setSuccessRows(0);
        batch.setFailRows(0);
        batch.setStatus(BATCH_STATUS_PENDING);
        batchMapper.insert(batch);

        BomHeader header = resolveHeader(request);
        batch.setHeaderId(header.getId());

        int nextLineNo = nextLineNo(header.getId());
        int success = 0;
        int failed = 0;
        List<BomImportRowError> errors = new ArrayList<>();
        for (BomImportRow row : rows) {
            BomImportRowError fatal = validateRequired(row);
            if (fatal != null) {
                errors.add(fatal);
                saveError(batch.getId(), row, fatal);
                failed++;
                continue;
            }
            BomImportRowError warning = validateDate(row);
            if (warning != null) {
                errors.add(warning);
                saveError(batch.getId(), row, warning);
            }
            persistLine(header.getId(), nextLineNo++, row);
            success++;
        }

        batch.setSuccessRows(success);
        batch.setFailRows(failed);
        batch.setStatus(resolveStatus(success, failed));
        batchMapper.updateById(batch);

        BomImportResult result = new BomImportResult();
        result.setBatchId(batch.getId());
        result.setBatchNo(batch.getBatchNo());
        result.setTotalRows(batch.getTotalRows());
        result.setSuccessRows(success);
        result.setFailRows(failed);
        result.setStatus(batch.getStatus());
        result.setErrors(errors);
        return result;
    }

    public PageResult<BomImportBatch> page(BomBatchQuery query) {
        Page<BomImportBatch> page = query.toPage();
        batchMapper.selectPage(page, Wrappers.<BomImportBatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getBomType()), BomImportBatch::getBomType, query.getBomType())
                .eq(StringUtils.hasText(query.getStatus()), BomImportBatch::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(BomImportBatch::getBatchNo, query.getKeyword()).or()
                        .like(BomImportBatch::getProductCode, query.getKeyword()).or()
                        .like(BomImportBatch::getSourceFile, query.getKeyword()))
                .orderByDesc(BomImportBatch::getCreatedAt));
        return PageResult.of(page);
    }

    public BomImportBatch getBatch(Long batchId) {
        BomImportBatch batch = batchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "导入批次不存在: " + batchId);
        }
        return batch;
    }

    public List<BomImportError> listErrors(Long batchId) {
        getBatch(batchId);
        return errorMapper.selectList(Wrappers.<BomImportError>lambdaQuery()
                .eq(BomImportError::getBatchId, batchId)
                .orderByAsc(BomImportError::getRowNumber)
                .orderByAsc(BomImportError::getId));
    }

    private BomHeader resolveHeader(BomImportRequest request) {
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : DEFAULT_VERSION;
        BomHeader existing = headerMapper.selectOne(Wrappers.<BomHeader>lambdaQuery()
                .eq(BomHeader::getProductCode, request.getProductCode())
                .eq(BomHeader::getBomType, request.getBomType())
                .eq(BomHeader::getVersionNo, versionNo));
        if (existing != null) {
            return existing;
        }
        BomHeader header = new BomHeader();
        header.setBomCode("BOM-" + request.getProductCode() + "-" + request.getBomType() + "-" + versionNo);
        header.setProductCode(request.getProductCode());
        header.setBomType(request.getBomType());
        header.setVersionNo(versionNo);
        header.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_DRAFT);
        header.setEffectiveFrom(request.getEffectiveFrom());
        headerMapper.insert(header);
        return header;
    }

    private BomImportRowError validateRequired(BomImportRow row) {
        if (!StringUtils.hasText(row.getParentMaterialCode())) {
            return error(row, "parentMaterialCode", "父件编码不能为空");
        }
        if (!StringUtils.hasText(row.getChildMaterialCode())) {
            return error(row, "childMaterialCode", "子件编码不能为空");
        }
        if (!StringUtils.hasText(row.getUnit())) {
            return error(row, "unit", "单位不能为空");
        }
        if (row.getQty() == null) {
            return error(row, "qty", "用量不能为空");
        }
        if (row.getQty().compareTo(BigDecimal.ZERO) <= 0) {
            return error(row, "qty", "用量必须大于 0");
        }
        return null;
    }

    private BomImportRowError validateDate(BomImportRow row) {
        LocalDate from = row.getValidFrom();
        LocalDate to = row.getValidTo();
        if (from != null && to != null && from.isAfter(to)) {
            return error(row, "validFrom", "（警告）生效日期晚于失效日期");
        }
        return null;
    }

    private void persistLine(Long headerId, int lineNo, BomImportRow row) {
        BomLine line = new BomLine();
        line.setHeaderId(headerId);
        line.setLineNo(lineNo);
        line.setParentMaterialCode(row.getParentMaterialCode());
        line.setChildMaterialCode(row.getChildMaterialCode());
        line.setChildMaterialName(row.getChildMaterialName());
        line.setQty(row.getQty());
        line.setUnit(row.getUnit());
        line.setItemSeq(row.getItemSeq());
        line.setSubstituteAllowed(row.getSubstituteAllowed() == null ? 0 : row.getSubstituteAllowed());
        line.setValidFrom(row.getValidFrom());
        line.setValidTo(row.getValidTo());
        lineMapper.insert(line);
    }

    private void saveError(Long batchId, BomImportRow row, BomImportRowError source) {
        BomImportError entity = new BomImportError();
        entity.setBatchId(batchId);
        entity.setSheetName(source.getSheetName());
        entity.setRowNumber(source.getRowNumber());
        entity.setFieldName(source.getField());
        entity.setErrorMessage(source.getMessage());
        entity.setRawRow(truncate(rawRow(row)));
        errorMapper.insert(entity);
    }

    private int nextLineNo(Long headerId) {
        Integer max = lineMapper.selectMaxLineNo(headerId);
        return max == null ? 1 : max + 1;
    }

    private String resolveStatus(int success, int failed) {
        if (failed == 0) {
            return BATCH_STATUS_SUCCESS;
        }
        if (success == 0) {
            return BATCH_STATUS_FAILED;
        }
        return BATCH_STATUS_PARTIAL;
    }

    private BomImportRowError error(BomImportRow row, String field, String message) {
        BomImportRowError error = new BomImportRowError();
        error.setSheetName(row.getSheetName());
        error.setRowNumber(row.getRowNumber());
        error.setField(field);
        error.setMessage(message);
        return error;
    }

    private String rawRow(BomImportRow row) {
        return "parent=" + row.getParentMaterialCode()
                + ",child=" + row.getChildMaterialCode()
                + ",qty=" + row.getQty()
                + ",unit=" + row.getUnit()
                + ",itemSeq=" + row.getItemSeq();
    }

    private String truncate(String value) {
        if (value == null || value.length() <= 1000) {
            return value;
        }
        return value.substring(0, 1000);
    }

    private String generateBatchNo() {
        return "BIMP" + LocalDateTime.now().format(BATCH_NO_FORMATTER)
                + ThreadLocalRandom.current().nextInt(1000, 10000);
    }
}
