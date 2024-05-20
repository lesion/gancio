This specification describes how Events object are structured in Activity Pub.
We do have a lot of software solutions right now that covers different use cases
so we are trying to stay much agnostic as possible.

### WHAT
To represent an `Event` yo MUST specify a `type` attribute with `Event` as a value.

An `Event` MUST have a `name` property to describe what the event is about.
You SHOULD parse for `nameMap` to represent this attribute in different language.

To support events update 

```json
{
  "type": "Event",
  "name": "OFFDEM 2024",
  "id": "https://demo.gancio.org/event/antani",
  "url": "https://demo.gancio.org/federation/"
}

A `summary` field SHOULD describe what the event is about.

A `content` field SHOULD describe what the event is about.

A `tag` array of strings SHOULD describe what the event is about. 

The `attachment` array SHOULD be used to represent different type of additional related content.

If the event has related images (flyers, banner) those SHOULD be represented in `attachment` array of object with the inner `type` 'Banner' or 'Document'. The media type MUST be present.


```

#### WHEN
An `Event` must specify a `startTime` in ISO format.

An `Event` SHOULD specify an `endTime` in ISO format that MUST be greater than `startTime`.

No, recurring events are not covered.

What about timezones?

#### WHERE
Events are hosted somewhere, this is not always somewhere but could be online also.

For online events an entry in the `attachment` array with `Link` as `type` MUST be specified.
This is a free text entry


#### WHO
`attributedTo` SHOULD be specified.


#### WHOM
Sometimes you do not want events to be indexable by everyone, you can have valid reason for that:
- evil actors trying to profile a specific type of events (e.g. LGBTQ+)

- do not make those events searchable
if the software implements a search function they MUST not include those events

- those events could not compare on grouped visualization (for instance, tag/category pages)




