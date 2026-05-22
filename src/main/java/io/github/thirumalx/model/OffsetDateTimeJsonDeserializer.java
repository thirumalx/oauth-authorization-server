package io.github.thirumalx.model;

import java.io.IOException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class OffsetDateTimeJsonDeserializer extends JsonDeserializer<OffsetDateTime> {

    private static final DateTimeFormatter ISO_OFFSET_DATE_TIME = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    private static final DateTimeFormatter ISO_LOCAL_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    @Override
    public OffsetDateTime deserialize(JsonParser parser, DeserializationContext ctxt) throws IOException {
        String value = parser.getValueAsString();
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return OffsetDateTime.parse(value, ISO_OFFSET_DATE_TIME);
        } catch (DateTimeParseException ignored) {
            try {
                LocalDate date = LocalDate.parse(value, ISO_LOCAL_DATE);
                return date.atStartOfDay().atOffset(ZoneOffset.UTC);
            } catch (DateTimeParseException ex) {
                throw ctxt.weirdStringException(value, OffsetDateTime.class, "Expected ISO_OFFSET_DATE_TIME or ISO_LOCAL_DATE");
            }
        }
    }
}
