"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type EnquiryModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function EnquiryModal({
  open,
  onClose,
}: EnquiryModalProps) {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSending(true);
    setSuccess(false);
    setErrorMessage("");

    const { error } = await supabase.from("enquiries").insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
    });

    if (error) {
      console.error("Enquiry submission error:", error);

      setErrorMessage(
        "We couldn't send your enquiry right now. Please try again."
      );

      setSending(false);
      return;
    }

    setSuccess(true);
    setSending(false);

    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
  }

  function handleClose() {
    if (sending) {
      return;
    }

    setSuccess(false);
    setErrorMessage("");
    onClose();
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/75
        px-4
        py-8
        backdrop-blur-md
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="
          relative
          w-full
          max-w-2xl
          overflow-hidden
          rounded-[30px]
          border
          border-white/15
          bg-[#111111]/95
          shadow-[0_30px_100px_rgba(0,0,0,0.7)]
        "
      >
        {/* Subtle glass glow */}
        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-orange-500/[0.08]
            blur-3xl
          "
        />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={sending}
          aria-label="Close enquiry form"
          className="
            absolute
            right-5
            top-5
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/15
            bg-white/[0.04]
            text-lg
            text-white/60
            transition-all
            duration-300
            hover:border-white/30
            hover:bg-white/[0.09]
            hover:text-white
          "
        >
          ×
        </button>

        <div className="relative z-10 p-6 sm:p-7 md:p-8">

          {/* Header */}
          <div className="pr-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/35">
              MIZO DEALS
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              LET&apos;S TALK.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">
              Have a question, a request, or something you&apos;d like to know?
              Send us a message and our team will get back to you.
            </p>
          </div>

          {/* Success message */}
          {success ? (
            <div className="mt-7 rounded-[22px] border border-white/10 bg-white/[0.035] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/30 bg-orange-500/10 text-2xl text-orange-300">
                ✓
              </div>

              <h3 className="mt-6 text-2xl font-medium text-white">
                ENQUIRY SENT
              </h3>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/50">
                Thank you for contacting MIZO DEALS. Your enquiry has been
                received successfully.
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="
                  mt-7
                  rounded-full
                  border
                  border-orange-400/40
                  bg-[#b45309]
                  px-7
                  py-3
                  text-xs
                  font-semibold
                  tracking-[0.18em]
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#c4620a]
                "
              >
                CLOSE
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >
              {/* Name + Email */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="enquiry-name"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40"
                  >
                    Name
                  </label>

                  <input
                    id="enquiry-name"
                    type="text"
                    required
                    minLength={2}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/25
                      transition-all
                      duration-300
                      focus:border-orange-400/50
                      focus:bg-white/[0.06]
                    "
                  />
                </div>

                <div>
                  <label
                    htmlFor="enquiry-email"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40"
                  >
                    Email
                  </label>

                  <input
                    id="enquiry-email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/25
                      transition-all
                      duration-300
                      focus:border-orange-400/50
                      focus:bg-white/[0.06]
                    "
                  />
                </div>

              </div>

              {/* Phone + Subject */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="enquiry-phone"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40"
                  >
                    Phone <span className="text-white/20">(optional)</span>
                  </label>

                  <input
                    id="enquiry-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone number"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/25
                      transition-all
                      duration-300
                      focus:border-orange-400/50
                      focus:bg-white/[0.06]
                    "
                  />
                </div>

                <div>
                  <label
                    htmlFor="enquiry-subject"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40"
                  >
                    Subject
                  </label>

                  <input
                    id="enquiry-subject"
                    type="text"
                    required
                    minLength={2}
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="What is it about?"
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      px-4
                      py-3.5
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-white/25
                      transition-all
                      duration-300
                      focus:border-orange-400/50
                      focus:bg-white/[0.06]
                    "
                  />
                </div>

              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="enquiry-message"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40"
                >
                  Message
                </label>

                <textarea
                  id="enquiry-message"
                  required
                  minLength={5}
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write your enquiry..."
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.045]
                    px-4
                    py-3.5
                    text-sm
                    leading-6
                    text-white
                    outline-none
                    placeholder:text-white/25
                    transition-all
                    duration-300
                    focus:border-orange-400/50
                    focus:bg-white/[0.06]
                  "
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="
                  group
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-orange-400/40
                  bg-[#b45309]
                  px-7
                  py-4
                  text-xs
                  font-semibold
                  tracking-[0.2em]
                  text-white
                  shadow-[0_10px_35px_rgba(180,83,9,0.18)]
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:border-orange-300/70
                  hover:bg-[#c4620a]
                  hover:shadow-[0_15px_45px_rgba(180,83,9,0.35)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  disabled:hover:translate-y-0
                "
              >
                {sending ? "SENDING..." : "SEND ENQUIRY"}

                {!sending && (
                  <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                )}
              </button>

              <p className="text-center text-[10px] uppercase tracking-[0.18em] text-white/20">
                We usually respond as soon as possible.
              </p>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
