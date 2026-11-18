package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.ErpFinanceVoucher;
import com.huaweicloud.plm.system.entity.ErpFinanceVoucherLine;
import lombok.Data;

import java.util.List;

/**
 * 记账凭证详情：头信息与分录行（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Data
public class ErpFinanceVoucherDetailResponse {

    private ErpFinanceVoucher header;

    private List<ErpFinanceVoucherLine> lines;
}
