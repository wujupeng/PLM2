package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpFinanceVoucherDetailResponse;
import com.huaweicloud.plm.system.dto.ErpFinanceVoucherLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpFinanceVoucherQuery;
import com.huaweicloud.plm.system.dto.ErpFinanceVoucherSaveRequest;
import com.huaweicloud.plm.system.entity.ErpFinanceVoucher;
import com.huaweicloud.plm.system.entity.ErpFinanceVoucherLine;
import com.huaweicloud.plm.system.mapper.ErpFinanceVoucherLineMapper;
import com.huaweicloud.plm.system.mapper.ErpFinanceVoucherMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 财务—记账凭证（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 记账凭证头与分录行的登记、分页查询、分录维护与删除。
 * 删除时先逻辑删除全部分录行，再物理删除记账凭证头以释放凭证号。
 */
@Service
@RequiredArgsConstructor
public class ErpFinanceVoucherService {

    private static final String DEFAULT_VOUCHER_NO_PREFIX = "FV";
    private static final String DEFAULT_VOUCHER_WORD = "记";
    private static final String DEFAULT_VOUCHER_TYPE = "MANUAL";
    private static final String DEFAULT_VOUCHER_STATUS = "DRAFT";
    private static final String DEFAULT_CURRENCY_CODE = "CNY";
    private static final BigDecimal DEFAULT_EXCHANGE_RATE = BigDecimal.ONE;

    private final ErpFinanceVoucherMapper mapper;
    private final ErpFinanceVoucherLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询记账凭证：状态/业务类型/会计期间精确，凭证号/摘要模糊，按主键倒序。 */
    public PageResult<ErpFinanceVoucher> page(ErpFinanceVoucherQuery query) {
        Page<ErpFinanceVoucher> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpFinanceVoucher>lambdaQuery()
                .eq(StringUtils.hasText(query.getVoucherStatus()),
                        ErpFinanceVoucher::getVoucherStatus, query.getVoucherStatus())
                .eq(StringUtils.hasText(query.getVoucherType()),
                        ErpFinanceVoucher::getBizType, query.getVoucherType())
                .eq(StringUtils.hasText(query.getPeriodCode()),
                        ErpFinanceVoucher::getPeriodCode, query.getPeriodCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpFinanceVoucher::getVoucherNo, query.getKeyword()).or()
                        .like(ErpFinanceVoucher::getSummary, query.getKeyword()))
                .orderByDesc(ErpFinanceVoucher::getId));
        return PageResult.of(page);
    }

    /** 记账凭证详情：返回记账凭证头与全部分录行。 */
    public ErpFinanceVoucherDetailResponse detail(Long id) {
        ErpFinanceVoucher header = require(id);
        ErpFinanceVoucherDetailResponse response = new ErpFinanceVoucherDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增记账凭证：回填默认凭证字/业务类型/金额/附件张数/状态与组织，凭证号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpFinanceVoucherSaveRequest request) {
        ErpFinanceVoucher header = new ErpFinanceVoucher();
        header.setVoucherNo(StringUtils.hasText(request.getVoucherNo())
                ? request.getVoucherNo() : flowSupport.nextBizNo(DEFAULT_VOUCHER_NO_PREFIX));
        header.setVoucherWord(StringUtils.hasText(request.getVoucherWord())
                ? request.getVoucherWord() : DEFAULT_VOUCHER_WORD);
        header.setBizType(StringUtils.hasText(request.getBizType())
                ? request.getBizType() : DEFAULT_VOUCHER_TYPE);
        header.setTotalDebit(request.getTotalDebit() != null
                ? request.getTotalDebit() : BigDecimal.ZERO);
        header.setTotalCredit(request.getTotalCredit() != null
                ? request.getTotalCredit() : BigDecimal.ZERO);
        header.setAttachmentCount(request.getAttachmentCount() != null
                ? request.getAttachmentCount() : 0);
        header.setVoucherStatus(StringUtils.hasText(request.getVoucherStatus())
                ? request.getVoucherStatus() : DEFAULT_VOUCHER_STATUS);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新记账凭证头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpFinanceVoucherSaveRequest request) {
        ErpFinanceVoucher header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除记账凭证：先逻辑删除全部分录行，再物理删除记账凭证头以释放凭证号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpFinanceVoucherLine>lambdaQuery()
                .eq(ErpFinanceVoucherLine::getVoucherId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增记账凭证分录行：行号为空时取当前最大行号 +1，回填默认币种/汇率/金额。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpFinanceVoucherLineSaveRequest request) {
        require(headerId);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpFinanceVoucherLine line = new ErpFinanceVoucherLine();
        line.setVoucherId(headerId);
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setDebitAmount(request.getDebitAmount() != null
                ? request.getDebitAmount() : BigDecimal.ZERO);
        line.setCreditAmount(request.getCreditAmount() != null
                ? request.getCreditAmount() : BigDecimal.ZERO);
        line.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode())
                ? request.getCurrencyCode() : DEFAULT_CURRENCY_CODE);
        line.setExchangeRate(request.getExchangeRate() != null
                ? request.getExchangeRate() : DEFAULT_EXCHANGE_RATE);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新记账凭证分录行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpFinanceVoucherLineSaveRequest request) {
        ErpFinanceVoucherLine line = requireLine(lineId);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除记账凭证分录行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpFinanceVoucher require(Long id) {
        ErpFinanceVoucher header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "记账凭证不存在: " + id);
        }
        return header;
    }

    private ErpFinanceVoucherLine requireLine(Long lineId) {
        ErpFinanceVoucherLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "记账凭证分录行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpFinanceVoucherLine> listLines(Long voucherId) {
        return lineMapper.selectList(Wrappers.<ErpFinanceVoucherLine>lambdaQuery()
                .eq(ErpFinanceVoucherLine::getVoucherId, voucherId)
                .orderByAsc(ErpFinanceVoucherLine::getLineNo));
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖记账凭证头字段。 */
    private void applyHeader(ErpFinanceVoucher header, ErpFinanceVoucherSaveRequest request) {
        if (StringUtils.hasText(request.getVoucherNo())) {
            header.setVoucherNo(request.getVoucherNo());
        }
        if (StringUtils.hasText(request.getVoucherWord())) {
            header.setVoucherWord(request.getVoucherWord());
        }
        if (StringUtils.hasText(request.getPeriodCode())) {
            header.setPeriodCode(request.getPeriodCode());
        }
        if (request.getVoucherDate() != null) {
            header.setVoucherDate(request.getVoucherDate());
        }
        if (StringUtils.hasText(request.getBizType())) {
            header.setBizType(request.getBizType());
        }
        if (StringUtils.hasText(request.getSourceNo())) {
            header.setSourceNo(request.getSourceNo());
        }
        if (request.getTotalDebit() != null) {
            header.setTotalDebit(request.getTotalDebit());
        }
        if (request.getTotalCredit() != null) {
            header.setTotalCredit(request.getTotalCredit());
        }
        if (request.getAttachmentCount() != null) {
            header.setAttachmentCount(request.getAttachmentCount());
        }
        if (StringUtils.hasText(request.getVoucherStatus())) {
            header.setVoucherStatus(request.getVoucherStatus());
        }
        if (StringUtils.hasText(request.getSummary())) {
            header.setSummary(request.getSummary());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            header.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            header.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            header.setRemark(request.getRemark());
        }
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖记账凭证分录行字段。 */
    private void applyLine(ErpFinanceVoucherLine line, ErpFinanceVoucherLineSaveRequest request) {
        if (StringUtils.hasText(request.getAccountCode())) {
            line.setAccountCode(request.getAccountCode());
        }
        if (StringUtils.hasText(request.getAccountName())) {
            line.setAccountName(request.getAccountName());
        }
        if (StringUtils.hasText(request.getSummary())) {
            line.setSummary(request.getSummary());
        }
        if (request.getDebitAmount() != null) {
            line.setDebitAmount(request.getDebitAmount());
        }
        if (request.getCreditAmount() != null) {
            line.setCreditAmount(request.getCreditAmount());
        }
        if (StringUtils.hasText(request.getCurrencyCode())) {
            line.setCurrencyCode(request.getCurrencyCode());
        }
        if (request.getExchangeRate() != null) {
            line.setExchangeRate(request.getExchangeRate());
        }
        if (StringUtils.hasText(request.getDeptCode())) {
            line.setDeptCode(request.getDeptCode());
        }
        if (StringUtils.hasText(request.getProjectCode())) {
            line.setProjectCode(request.getProjectCode());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            line.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getDescription())) {
            line.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            line.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
