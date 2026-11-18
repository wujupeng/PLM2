package com.huaweicloud.plm.system.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.datamatrix.encoder.SymbolShapeHint;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * 条码生成服务（N5）：支持 Data Matrix / 二维码 / CODE128，输出 PNG、Base64、SVG、0/1 矩阵。
 */
@Service
public class BarcodeService {

    private static final int DEFAULT_SIZE = 240;
    private static final int CODE128_HEIGHT = 40;
    private static final String TYPE_DATA_MATRIX = "DATA_MATRIX";
    private static final String TYPE_QR = "QR";
    private static final String TYPE_CODE128 = "CODE128";
    private static final String DATA_URI_PREFIX = "data:image/png;base64,";

    /**
     * 生成条码 PNG 字节。barcodeType 支持 DATA_MATRIX / QR / CODE128（大小写不敏感，空值默认 DATA_MATRIX）。
     */
    public byte[] toPng(String content, int sizePx, String barcodeType) {
        BitMatrix matrix = encode(content, sizePx, barcodeType);
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            ImageIO.write(image, "PNG", out);
            return out.toByteArray();
        } catch (Exception ex) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "条码内容无法生成: " + content + "（" + ex.getMessage() + "）");
        }
    }

    /**
     * 生成 "data:image/png;base64," 前缀的字符串，便于前端 img src 直接使用。
     */
    public String toBase64Png(String content, int sizePx, String barcodeType) {
        byte[] png = toPng(content, sizePx, barcodeType);
        return DATA_URI_PREFIX + Base64.getEncoder().encodeToString(png);
    }

    /**
     * 生成 SVG 文本。
     */
    public String toSvg(String content, int moduleSize, String barcodeType) {
        BitMatrix matrix = encode(content, DEFAULT_SIZE, barcodeType);
        int module = moduleSize <= 0 ? 1 : moduleSize;
        int width = matrix.getWidth();
        int height = matrix.getHeight();
        StringBuilder svg = new StringBuilder();
        svg.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        svg.append("<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"")
                .append(width * module).append("\" height=\"").append(height * module)
                .append("\" viewBox=\"0 0 ").append(width).append(" ").append(height).append("\">");
        svg.append("<rect width=\"100%\" height=\"100%\" fill=\"#FFFFFF\"/>");
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (matrix.get(x, y)) {
                    svg.append("<rect x=\"").append(x * module).append("\" y=\"").append(y * module)
                            .append("\" width=\"").append(module).append("\" height=\"").append(module)
                            .append("\" fill=\"#000000\"/>");
                }
            }
        }
        svg.append("</svg>");
        return svg.toString();
    }

    /**
     * 生成 0/1 矩阵字符串列表（每个字符串为一行），便于前端或打印代理自行渲染。
     */
    public List<String> toMatrix(String content, String barcodeType) {
        BitMatrix matrix = encode(content, DEFAULT_SIZE, barcodeType);
        int width = matrix.getWidth();
        int height = matrix.getHeight();
        List<String> rows = new ArrayList<>(height);
        for (int y = 0; y < height; y++) {
            StringBuilder row = new StringBuilder(width);
            for (int x = 0; x < width; x++) {
                row.append(matrix.get(x, y) ? '1' : '0');
            }
            rows.add(row.toString());
        }
        return rows;
    }

    /**
     * 依据条码类型执行编码，异常统一包装为业务异常。
     */
    private BitMatrix encode(String content, int sizePx, String barcodeType) {
        int size = sizePx <= 0 ? DEFAULT_SIZE : sizePx;
        String type = StringUtils.hasText(barcodeType) ? barcodeType.trim().toUpperCase() : TYPE_DATA_MATRIX;
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            BarcodeFormat format;
            int width = size;
            int height = size;
            switch (type) {
                case TYPE_QR -> {
                    format = BarcodeFormat.QR_CODE;
                    hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
                    hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
                }
                case TYPE_CODE128 -> {
                    format = BarcodeFormat.CODE_128;
                    width = size;
                    height = CODE128_HEIGHT;
                }
                default -> {
                    format = BarcodeFormat.DATA_MATRIX;
                    hints.put(EncodeHintType.DATA_MATRIX_SHAPE, SymbolShapeHint.FORCE_SQUARE);
                    hints.put(EncodeHintType.MARGIN, 1);
                }
            }
            return new MultiFormatWriter().encode(content, format, width, height, hints);
        } catch (Exception ex) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "条码内容无法生成: " + content + "（" + ex.getMessage() + "）");
        }
    }
}
