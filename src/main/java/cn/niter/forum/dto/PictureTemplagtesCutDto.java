package cn.niter.forum.dto;


import lombok.Data;

import java.util.Map;

@Data
public class PictureTemplagtesCutDto {
    private Integer x;
    private Map<String, byte[]> pictureMap;

}
